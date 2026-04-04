import datetime

from django.contrib.auth import authenticate
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Building, Reservation, Space
from .serializers import (
    BuildingWithSpacesSerializer,
    ReservationCancelSerializer,
    ReservationCreateSerializer,
    ReservationQuerySerializer,
    ReservationSerializer,
    SpaceOccupiedSlotSerializer,
)


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


class ReservationListCreateView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name="name", type=str, required=True, description="신청자 이름"),
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
            OpenApiParameter(name="date", type=str, required=False, description="날짜 필터 (예: 2026-04-01)"),
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
        qs = Reservation.objects.select_related("space__building")
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
            start_datetime__date=date,
        ).order_by("start_datetime")
        serializer = SpaceOccupiedSlotSerializer(reservations, many=True)
        return Response(serializer.data)


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
            reservation = Reservation.objects.get(pk=pk)
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
