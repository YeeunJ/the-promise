import datetime
import io

from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Building, Reservation, Space, Team
from .serializers import (
    AdminBuildingSerializer,
    AdminBuildingWriteSerializer,
    AdminReservationStatusSerializer,
    AdminSpaceSerializer,
    AdminSpaceWriteSerializer,
    AdminTeamSerializer,
    AdminTeamWriteSerializer,
    BuildingWithSpacesSerializer,
    OverlappingSlotSerializer,
    ReservationCancelSerializer,
    ReservationCreateSerializer,
    ReservationQuerySerializer,
    ReservationSerializer,
    SpaceAvailabilityQuerySerializer,
    SpaceAvailabilitySerializer,
    SpaceOccupiedSlotSerializer,
    TeamSerializer,
)
from .ticket import generate_ticket_image


class TeamListView(APIView):
    @extend_schema(responses=TeamSerializer(many=True))
    def get(self, request):
        teams = Team.objects.filter(is_active=True).order_by("name")
        return Response(TeamSerializer(teams, many=True).data)


class SpaceListView(APIView):
    @extend_schema(responses=BuildingWithSpacesSerializer(many=True))
    def get(self, request):
        buildings = (
            Building.objects
            .filter(is_active=True)
            .prefetch_related("spaces")
        )
        # is_active인 공간만 포함하도록 필터링
        for building in buildings:
            building._prefetched_objects_cache["spaces"] = [
                s for s in building.spaces.all() if s.is_active
            ]
        serializer = BuildingWithSpacesSerializer(buildings, many=True)
        return Response(serializer.data)


class SpaceAvailabilityView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name="start_datetime", type=str, required=True,  description="조회 시작일시 (ISO 8601)"),
            OpenApiParameter(name="end_datetime",   type=str, required=True,  description="조회 종료일시 (ISO 8601)"),
            OpenApiParameter(name="show_unavailable", type=str, required=True, description="완전 불가능한 방 포함 여부 (Y/N)"),
            OpenApiParameter(name="building_id",    type=int, required=False, description="건물 필터"),
            OpenApiParameter(name="floor",          type=int, required=False, description="층 필터"),
            OpenApiParameter(name="keyword",        type=str, required=False, description="공간 이름 포함 검색"),
        ],
        responses={
            200: SpaceAvailabilitySerializer(many=True),
            400: OpenApiResponse(
                response=inline_serializer("SpaceAvailabilityErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="파라미터 오류 — `validation_error`",
            ),
        },
    )
    def get(self, request):
        query_serializer = SpaceAvailabilityQuerySerializer(data=request.query_params)
        if not query_serializer.is_valid():
            errors = query_serializer.errors
            if "non_field_errors" in errors:
                msg = str(errors["non_field_errors"][0])
            else:
                msg = str(next(iter(errors.values()))[0])
            return Response(
                {"error": "validation_error", "message": msg},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data             = query_serializer.validated_data
        S                = data["start_datetime"]
        E                = data["end_datetime"]
        show_unavailable = data["show_unavailable"] == "Y"

        spaces = Space.objects.filter(is_active=True).select_related("building")
        if "building_id" in data:
            spaces = spaces.filter(building_id=data["building_id"])
        if "floor" in data:
            spaces = spaces.filter(floor=data["floor"])
        if "keyword" in data:
            spaces = spaces.filter(name__icontains=data["keyword"])

        results = []
        for space in spaces:
            overlapping = list(
                Reservation.objects.filter(
                    space=space,
                    status=Reservation.Status.CONFIRMED,
                    is_deleted=False,
                    start_datetime__lt=E,
                    end_datetime__gt=S,
                ).values("start_datetime", "end_datetime")
            )

            if not overlapping:
                availability = "full"
            elif any(r["start_datetime"] <= S and r["end_datetime"] >= E for r in overlapping):
                availability = "none"
            else:
                availability = "partial"

            if availability == "none" and not show_unavailable:
                continue

            results.append({
                "id":          space.id,
                "building":    space.building,
                "name":        space.name,
                "floor":       space.floor,
                "capacity":    space.capacity,
                "description": space.description,
                "availability": availability,
                "overlapping_reservations": overlapping if availability != "full" else [],
            })

        order = {"full": 0, "partial": 1, "none": 2}
        results.sort(key=lambda x: order[x["availability"]])

        serializer = SpaceAvailabilitySerializer(results, many=True)
        return Response(serializer.data)


class ReservationListCreateView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name="name",  type=str, required=True, description="신청자 이름"),
            OpenApiParameter(name="phone", type=str, required=True, description="신청자 연락처"),
        ],
        responses={
            200: ReservationSerializer(many=True),
            400: OpenApiResponse(
                response=inline_serializer("ReservationListErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="이름(name) 또는 연락처(phone) 파라미터가 누락된 경우 — `validation_error`",
            ),
        },
    )
    def get(self, request):
        query_serializer = ReservationQuerySerializer(data=request.query_params)
        if not query_serializer.is_valid():
            return Response(
                {"error": "validation_error", "message": "이름과 연락처를 입력해주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reservations = Reservation.objects.filter(
            applicant_name=query_serializer.validated_data["name"],
            applicant_phone=query_serializer.validated_data["phone"],
            is_deleted=False,
        ).select_related("space__building")
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=ReservationCreateSerializer,
        responses={
            201: OpenApiResponse(
                response=ReservationSerializer,
                description="예약 신청 완료. 시간 중복 없으면 `confirmed`, 중복이면 `rejected`로 저장됨",
            ),
            400: OpenApiResponse(
                response=inline_serializer("ReservationCreateErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description=(
                    "입력값 오류 — `validation_error`\n\n"
                    "- 비활성 공간에 예약 신청\n"
                    "- 과거 시간으로 예약 신청\n"
                    "- 종료 시간이 시작 시간보다 빠르거나 같음\n"
                    "- 30분 단위가 아닌 시간으로 신청"
                ),
            ),
        },
    )
    def post(self, request):
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.save()
        return Response(
            ReservationSerializer(reservation).data,
            status=status.HTTP_201_CREATED,
        )


class ReservationTicketView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name="name",  type=str, required=True, description="신청자 이름"),
            OpenApiParameter(name="phone", type=str, required=True, description="신청자 연락처"),
        ],
        responses={
            200: OpenApiResponse(description="예약 티켓 PNG 이미지"),
            400: OpenApiResponse(
                response=inline_serializer("TicketValidationErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="name 또는 phone 파라미터 누락 — `validation_error`",
            ),
            403: OpenApiResponse(
                response=inline_serializer("TicketForbiddenResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="name/phone 불일치 — `forbidden`",
            ),
            404: OpenApiResponse(
                response=inline_serializer("TicketNotFoundResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="예약 없음 또는 삭제된 예약 — `not_found`",
            ),
        },
    )
    def get(self, request, pk):
        name  = request.query_params.get("name")
        phone = request.query_params.get("phone")
        if not name or not phone:
            return Response(
                {"error": "validation_error", "message": "name과 phone 파라미터가 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            reservation = Reservation.objects.select_related("space__building").get(
                pk=pk, is_deleted=False
            )
        except Reservation.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "예약을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if reservation.applicant_name != name or reservation.applicant_phone != phone:
            return Response(
                {"error": "forbidden", "message": "예약 정보가 일치하지 않습니다."},
                status=status.HTTP_403_FORBIDDEN,
            )

        image  = generate_ticket_image(reservation)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        return HttpResponse(buffer, content_type="image/png")


class AdminLoginView(APIView):
    @extend_schema(
        request=inline_serializer(
            name="AdminLoginRequest",
            fields={
                "username": serializers.CharField(),
                "password": serializers.CharField(),
            },
        ),
        responses={
            200: OpenApiResponse(
                response=inline_serializer("AdminLoginResponse", fields={"token": serializers.CharField()}),
                description="로그인 성공. 이후 요청에 `Authorization: Token <token>` 헤더로 사용",
            ),
            401: OpenApiResponse(
                response=inline_serializer("AdminLoginErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="아이디 또는 비밀번호가 올바르지 않은 경우 — `unauthorized`",
            ),
        },
    )
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"error": "unauthorized", "message": "아이디 또는 비밀번호가 올바르지 않습니다."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})


class AdminReservationListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name="date",   type=str, required=False, description="날짜 필터 (예: 2026-04-01)"),
            OpenApiParameter(name="status", type=str, required=False, description="상태 필터 (confirmed / rejected / cancelled / pending)"),
        ],
        responses={
            200: ReservationSerializer(many=True),
            400: OpenApiResponse(
                response=inline_serializer("AdminReservationListErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="date 파라미터 형식이 올바르지 않은 경우 (예: `abc`) — `validation_error`",
            ),
            401: OpenApiResponse(
                response=inline_serializer("AdminReservationListUnauthorizedResponse", fields={
                    "detail": serializers.CharField(),
                }),
                description="Authorization 토큰이 없거나 유효하지 않은 경우",
            ),
        },
    )
    def get(self, request):
        qs = Reservation.objects.filter(is_deleted=False).select_related("space__building")
        date = request.query_params.get("date")
        status_filter = request.query_params.get("status")
        if date:
            try:
                datetime.date.fromisoformat(date)
            except ValueError:
                return Response(
                    {"error": "validation_error", "message": "날짜 형식이 올바르지 않습니다. (예: 2026-04-01)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(start_datetime__date=date)
        if status_filter:
            qs = qs.filter(status=status_filter)
        serializer = ReservationSerializer(qs, many=True)
        return Response(serializer.data)


class AdminReservationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: ReservationSerializer,
            401: OpenApiResponse(
                response=inline_serializer("ReservationDetailUnauthorizedResponse", fields={"detail": serializers.CharField()}),
                description="Authorization 토큰이 없거나 유효하지 않은 경우",
            ),
            404: OpenApiResponse(
                response=inline_serializer("ReservationDetailNotFoundResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="예약 없음 또는 삭제된 예약 — `not_found`",
            ),
        },
    )
    def get(self, request, pk):
        try:
            reservation = Reservation.objects.select_related("space__building").get(pk=pk, is_deleted=False)
        except Reservation.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "예약을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ReservationSerializer(reservation).data)

    @extend_schema(
        responses={
            204: OpenApiResponse(description="소프트 삭제 완료"),
            401: OpenApiResponse(
                response=inline_serializer("DeleteUnauthorizedResponse", fields={"detail": serializers.CharField()}),
                description="Authorization 토큰이 없거나 유효하지 않은 경우",
            ),
            404: OpenApiResponse(
                response=inline_serializer("DeleteNotFoundResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="예약 없음 또는 이미 삭제된 예약 — `not_found`",
            ),
        },
    )
    def delete(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk, is_deleted=False)
        except Reservation.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "예약을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        reservation.is_deleted = True
        reservation.deleted_at = timezone.now()
        reservation.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SpaceReservationListView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name="date", type=str, required=True, description="조회할 날짜 (예: 2026-04-10)"),
        ],
        responses={
            200: SpaceOccupiedSlotSerializer(many=True),
            400: OpenApiResponse(
                response=inline_serializer("SpaceReservationListErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description=(
                    "파라미터 오류 — `validation_error`\n\n"
                    "- date 파라미터가 없는 경우\n"
                    "- date 형식이 올바르지 않은 경우 (예: `abc`)"
                ),
            ),
            404: OpenApiResponse(
                response=inline_serializer("SpaceReservationListNotFoundResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="해당 id의 공간이 존재하지 않는 경우 — `not_found`",
            ),
        },
    )
    def get(self, request, pk):
        date = request.query_params.get("date")
        if not date:
            return Response(
                {"error": "validation_error", "message": "date 파라미터가 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            datetime.date.fromisoformat(date)
        except ValueError:
            return Response(
                {"error": "validation_error", "message": "날짜 형식이 올바르지 않습니다. (예: 2026-04-01)"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            Space.objects.get(pk=pk)
        except Space.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "공간을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        reservations = Reservation.objects.filter(
            space_id=pk,
            status=Reservation.Status.CONFIRMED,
            is_deleted=False,
            start_datetime__date=date,
        ).order_by("start_datetime")
        serializer = SpaceOccupiedSlotSerializer(reservations, many=True)
        return Response(serializer.data)


class ReservationPublicCancelView(APIView):
    @extend_schema(
        request=inline_serializer(
            name="PublicCancelRequest",
            fields={
                "name":  serializers.CharField(),
                "phone": serializers.CharField(),
            },
        ),
        responses={
            200: ReservationSerializer,
            400: OpenApiResponse(
                response=inline_serializer("PublicCancelErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description=(
                    "취소 불가 상태 오류\n\n"
                    "- name/phone 파라미터 누락 — `validation_error`\n"
                    "- 이미 취소된 예약 — `already_cancelled`\n"
                    "- 거절된 예약 — `cannot_cancel_rejected`"
                ),
            ),
            403: OpenApiResponse(
                response=inline_serializer("PublicCancelForbiddenResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="name/phone 불일치 — `forbidden`",
            ),
            404: OpenApiResponse(
                response=inline_serializer("PublicCancelNotFoundResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="예약 없음 또는 삭제된 예약 — `not_found`",
            ),
        },
    )
    def post(self, request, pk):
        name  = request.data.get("name")
        phone = request.data.get("phone")
        if not name or not phone:
            return Response(
                {"error": "validation_error", "message": "name과 phone이 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            reservation = Reservation.objects.get(pk=pk, is_deleted=False)
        except Reservation.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "예약을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if reservation.applicant_name != name or reservation.applicant_phone != phone:
            return Response(
                {"error": "forbidden", "message": "예약 정보가 일치하지 않습니다."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if reservation.status == Reservation.Status.CANCELLED:
            return Response(
                {"error": "already_cancelled", "message": "이미 취소된 예약입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if reservation.status == Reservation.Status.REJECTED:
            return Response(
                {"error": "cannot_cancel_rejected", "message": "거절된 예약은 취소할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reservation.status = Reservation.Status.CANCELLED
        reservation.save()
        return Response(ReservationSerializer(reservation).data)


class AdminReservationCancelView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ReservationCancelSerializer,
        responses={
            200: ReservationSerializer,
            400: OpenApiResponse(
                response=inline_serializer("CancelErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description=(
                    "취소 불가 상태 오류\n\n"
                    "- 이미 취소된 예약인 경우 — `already_cancelled`\n"
                    "- 거절된 예약은 취소할 수 없는 경우 — `cannot_cancel_rejected`"
                ),
            ),
            401: OpenApiResponse(
                response=inline_serializer("CancelUnauthorizedResponse", fields={
                    "detail": serializers.CharField(),
                }),
                description="Authorization 토큰이 없거나 유효하지 않은 경우",
            ),
            404: OpenApiResponse(
                response=inline_serializer("CancelNotFoundResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="해당 id의 예약이 존재하지 않는 경우 — `not_found`",
            ),
        },
    )
    def post(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk, is_deleted=False)
        except Reservation.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "예약을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if reservation.status == Reservation.Status.CANCELLED:
            return Response(
                {"error": "already_cancelled", "message": "이미 취소된 예약입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if reservation.status == Reservation.Status.REJECTED:
            return Response(
                {"error": "cannot_cancel_rejected", "message": "거절된 예약은 취소할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ReservationCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation.status = Reservation.Status.CANCELLED
        reservation.admin_note = serializer.validated_data["admin_note"]
        reservation.save()
        return Response(ReservationSerializer(reservation).data)


# ── Admin CRUD Views ──────────────────────────────────────────────────────────

def _admin_validation_error(errors):
    """DRF serializer 에러를 커스텀 포맷으로 변환."""
    for field, msgs in errors.items():
        msg = str(msgs[0]) if field == "non_field_errors" else f"{field}: {msgs[0]}"
        break
    return Response({"error": "validation_error", "message": msg}, status=status.HTTP_400_BAD_REQUEST)


class AdminTeamListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=AdminTeamSerializer(many=True))
    def get(self, request):
        teams = Team.objects.all().select_related("department", "pastor").order_by("department__name", "name")
        return Response(AdminTeamSerializer(teams, many=True).data)

    @extend_schema(request=AdminTeamWriteSerializer, responses={201: AdminTeamSerializer})
    def post(self, request):
        ser = AdminTeamWriteSerializer(data=request.data)
        if not ser.is_valid():
            return _admin_validation_error(ser.errors)
        team = Team.objects.select_related("department", "pastor").get(pk=ser.save().pk)
        return Response(AdminTeamSerializer(team).data, status=status.HTTP_201_CREATED)


class AdminTeamDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_team(self, pk):
        try:
            return Team.objects.select_related("department", "pastor").get(pk=pk)
        except Team.DoesNotExist:
            return None

    @extend_schema(request=AdminTeamWriteSerializer, responses={200: AdminTeamSerializer})
    def patch(self, request, pk):
        team = self._get_team(pk)
        if team is None:
            return Response({"error": "not_found", "message": "팀을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        ser = AdminTeamWriteSerializer(team, data=request.data, partial=True)
        if not ser.is_valid():
            return _admin_validation_error(ser.errors)
        ser.save()
        team = Team.objects.select_related("department", "pastor").get(pk=team.pk)
        return Response(AdminTeamSerializer(team).data)

    @extend_schema(responses={204: OpenApiResponse(description="소프트 삭제 완료")})
    def delete(self, request, pk):
        team = self._get_team(pk)
        if team is None:
            return Response({"error": "not_found", "message": "팀을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        team.is_active = False
        team.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminBuildingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=AdminBuildingSerializer(many=True))
    def get(self, request):
        buildings = Building.objects.all().order_by("name")
        return Response(AdminBuildingSerializer(buildings, many=True).data)

    @extend_schema(request=AdminBuildingWriteSerializer, responses={201: AdminBuildingSerializer})
    def post(self, request):
        ser = AdminBuildingWriteSerializer(data=request.data)
        if not ser.is_valid():
            return _admin_validation_error(ser.errors)
        building = ser.save()
        return Response(AdminBuildingSerializer(building).data, status=status.HTTP_201_CREATED)


class AdminBuildingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_building(self, pk):
        try:
            return Building.objects.get(pk=pk)
        except Building.DoesNotExist:
            return None

    @extend_schema(request=AdminBuildingWriteSerializer, responses={200: AdminBuildingSerializer})
    def patch(self, request, pk):
        building = self._get_building(pk)
        if building is None:
            return Response({"error": "not_found", "message": "건물을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        ser = AdminBuildingWriteSerializer(building, data=request.data, partial=True)
        if not ser.is_valid():
            return _admin_validation_error(ser.errors)
        ser.save()
        return Response(AdminBuildingSerializer(building).data)

    @extend_schema(responses={204: OpenApiResponse(description="소프트 삭제 완료")})
    def delete(self, request, pk):
        building = self._get_building(pk)
        if building is None:
            return Response({"error": "not_found", "message": "건물을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        if building.spaces.filter(is_active=True).exists():
            return Response(
                {"error": "conflict", "message": "활성 공간이 있어 삭제할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        building.is_active = False
        building.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSpaceListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=AdminSpaceSerializer(many=True))
    def get(self, request):
        spaces = Space.objects.all().select_related("building").order_by("building__name", "name")
        return Response(AdminSpaceSerializer(spaces, many=True).data)

    @extend_schema(request=AdminSpaceWriteSerializer, responses={201: AdminSpaceSerializer})
    def post(self, request):
        ser = AdminSpaceWriteSerializer(data=request.data)
        if not ser.is_valid():
            return _admin_validation_error(ser.errors)
        space = Space.objects.select_related("building").get(pk=ser.save().pk)
        return Response(AdminSpaceSerializer(space).data, status=status.HTTP_201_CREATED)


class AdminSpaceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_space(self, pk):
        try:
            return Space.objects.select_related("building").get(pk=pk)
        except Space.DoesNotExist:
            return None

    @extend_schema(request=AdminSpaceWriteSerializer, responses={200: AdminSpaceSerializer})
    def patch(self, request, pk):
        space = self._get_space(pk)
        if space is None:
            return Response({"error": "not_found", "message": "공간을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        ser = AdminSpaceWriteSerializer(space, data=request.data, partial=True)
        if not ser.is_valid():
            return _admin_validation_error(ser.errors)
        ser.save()
        return Response(AdminSpaceSerializer(space).data)

    @extend_schema(responses={204: OpenApiResponse(description="소프트 삭제 완료")})
    def delete(self, request, pk):
        space = self._get_space(pk)
        if space is None:
            return Response({"error": "not_found", "message": "공간을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        space.is_active = False
        space.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminReservationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=AdminReservationStatusSerializer,
        responses={
            200: ReservationSerializer,
            400: OpenApiResponse(
                response=inline_serializer("StatusChangeErrorResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description=(
                    "상태 변경 불가\n\n"
                    "- pending 아닌 예약 변경 시도 — `invalid_status_transition`\n"
                    "- confirmed 변경 시 충돌 — `conflict`"
                ),
            ),
            404: OpenApiResponse(
                response=inline_serializer("StatusChangeNotFoundResponse", fields={
                    "error": serializers.CharField(),
                    "message": serializers.CharField(),
                }),
                description="예약 없음 또는 삭제된 예약 — `not_found`",
            ),
        },
    )
    def patch(self, request, pk):
        try:
            reservation = Reservation.objects.select_related("space__building").get(pk=pk, is_deleted=False)
        except Reservation.DoesNotExist:
            return Response({"error": "not_found", "message": "예약을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status != Reservation.Status.PENDING:
            return Response(
                {"error": "invalid_status_transition", "message": "pending 상태인 예약만 변경할 수 있습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ser = AdminReservationStatusSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        new_status = ser.validated_data["status"]

        if new_status == Reservation.Status.CONFIRMED and reservation.has_conflict():
            return Response(
                {"error": "conflict", "message": "해당 시간대에 이미 확정된 예약이 있습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.status = new_status
        reservation.admin_note = ser.validated_data["admin_note"]
        reservation.save()
        return Response(ReservationSerializer(reservation).data)
