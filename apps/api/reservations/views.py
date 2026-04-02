from django.contrib.auth import authenticate
from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
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
        responses=ReservationSerializer(many=True),
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

    @extend_schema(request=ReservationCreateSerializer, responses={201: ReservationSerializer})
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
        responses=inline_serializer(
            name="AdminLoginResponse",
            fields={"token": serializers.CharField()},
        ),
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
        responses=ReservationSerializer(many=True),
    )
    def get(self, request):
        qs = Reservation.objects.select_related("space__building")
        date = request.query_params.get("date")
        status_filter = request.query_params.get("status")
        if date:
            qs = qs.filter(start_datetime__date=date)
        if status_filter:
            qs = qs.filter(status=status_filter)
        serializer = ReservationSerializer(qs, many=True)
        return Response(serializer.data)


class AdminReservationCancelView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=ReservationCancelSerializer, responses=ReservationSerializer)
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
        serializer = ReservationCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation.status = Reservation.Status.CANCELLED
        reservation.admin_note = serializer.validated_data["admin_note"]
        reservation.save()
        return Response(ReservationSerializer(reservation).data)
