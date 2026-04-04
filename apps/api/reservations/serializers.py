from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import Building, Space, Reservation


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ["id", "name", "description"]


class SpaceSerializer(serializers.ModelSerializer):
    building = BuildingSerializer(read_only=True)

    class Meta:
        model = Space
        fields = ["id", "building", "name", "floor", "capacity", "description"]


class BuildingWithSpacesSerializer(serializers.ModelSerializer):
    spaces = SpaceSerializer(many=True, read_only=True)

    class Meta:
        model = Building
        fields = ["id", "name", "description", "spaces"]


class ReservationSerializer(serializers.ModelSerializer):
    space = SpaceSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "space", "applicant_name", "applicant_phone",
            "applicant_team", "leader_phone", "headcount",
            "purpose", "start_datetime", "end_datetime",
            "status", "admin_note", "created_at",
        ]


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            "space", "applicant_name", "applicant_phone",
            "applicant_team", "leader_phone", "headcount",
            "purpose", "start_datetime", "end_datetime",
        ]

    def validate(self, data):
        if not data["space"].is_active:
            raise serializers.ValidationError({
                "error": "validation_error",
                "message": "예약이 불가능한 공간입니다.",
            })
        if data["start_datetime"] < timezone.now():
            raise serializers.ValidationError({
                "error": "validation_error",
                "message": "과거 시간으로는 예약할 수 없습니다.",
            })
        if data["end_datetime"] <= data["start_datetime"]:
            raise serializers.ValidationError({
                "error": "validation_error",
                "message": "종료 시간은 시작 시간보다 늦어야 합니다.",
            })
        duration = data["end_datetime"] - data["start_datetime"]
        total_seconds = int(duration.total_seconds())
        if total_seconds % 1800 != 0:
            raise serializers.ValidationError({
                "error": "validation_error",
                "message": "예약은 30분 단위로만 신청할 수 있습니다.",
            })
        return data

    def create(self, validated_data):
        with transaction.atomic():
            # 같은 공간에 대한 동시 요청을 직렬화
            # select_for_update()로 space row를 잠가 conflict 체크~저장을 원자적으로 처리
            Space.objects.select_for_update().get(pk=validated_data['space'].pk)

            reservation = Reservation(**validated_data)
            if reservation.has_conflict():
                reservation.status = Reservation.Status.REJECTED
            else:
                reservation.status = Reservation.Status.CONFIRMED
            reservation.save()
        return reservation


class ReservationQuerySerializer(serializers.Serializer):
    name  = serializers.CharField()
    phone = serializers.CharField()


class ReservationCancelSerializer(serializers.Serializer):
    admin_note = serializers.CharField(required=False, allow_blank=True, default="")


class SpaceOccupiedSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ["start_datetime", "end_datetime"]
