from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import Building, Department, Pastor, Space, Reservation, Team


class PastorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Pastor
        fields = ["id", "name", "title"]


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Team
        fields = ["id", "name", "leader_phone"]


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
    space          = SpaceSerializer(read_only=True)
    applicant_team = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id", "space", "applicant_name", "applicant_phone",
            "team", "custom_team_name", "applicant_team",
            "leader_phone", "headcount",
            "purpose", "start_datetime", "end_datetime",
            "status", "admin_note", "created_at",
        ]

    def get_applicant_team(self, obj) -> str:
        return obj.team.name if obj.team else obj.custom_team_name


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            "space", "applicant_name", "applicant_phone",
            "team", "custom_team_name", "leader_phone", "headcount",
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


class OverlappingSlotSerializer(serializers.Serializer):
    start_datetime = serializers.DateTimeField()
    end_datetime   = serializers.DateTimeField()


class SpaceAvailabilitySerializer(serializers.Serializer):
    id                       = serializers.IntegerField()
    building                 = BuildingSerializer()
    name                     = serializers.CharField()
    floor                    = serializers.IntegerField(allow_null=True)
    capacity                 = serializers.IntegerField(allow_null=True)
    description              = serializers.CharField(allow_null=True)
    availability             = serializers.ChoiceField(choices=["full", "partial", "none"])
    overlapping_reservations = OverlappingSlotSerializer(many=True)


class SpaceAvailabilityQuerySerializer(serializers.Serializer):
    start_datetime   = serializers.DateTimeField()
    end_datetime     = serializers.DateTimeField()
    show_unavailable = serializers.ChoiceField(choices=["Y", "N"])
    building_id      = serializers.IntegerField(required=False)
    floor            = serializers.IntegerField(required=False)
    keyword          = serializers.CharField(required=False)

    def validate(self, data):
        if data["end_datetime"] <= data["start_datetime"]:
            raise serializers.ValidationError("종료 일시는 시작 일시보다 늦어야 합니다.")
        return data


# ── Admin CRUD Serializers ────────────────────────────────────────────────────

class AdminDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Department
        fields = ["id", "name"]


class AdminTeamSerializer(serializers.ModelSerializer):
    department = AdminDepartmentSerializer(read_only=True)
    pastor     = PastorSerializer(read_only=True)

    class Meta:
        model  = Team
        fields = ["id", "name", "department", "pastor", "leader_phone", "is_active", "created_at"]


class AdminTeamWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Team
        fields = ["name", "department", "pastor", "leader_phone"]


class AdminBuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Building
        fields = ["id", "name", "description", "is_active", "created_at"]


class AdminBuildingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Building
        fields = ["name", "description"]


class AdminSpaceSerializer(serializers.ModelSerializer):
    building = BuildingSerializer(read_only=True)

    class Meta:
        model  = Space
        fields = ["id", "building", "name", "floor", "capacity", "description", "is_active", "created_at"]


class AdminSpaceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Space
        fields = ["building", "name", "floor", "capacity", "description"]


class AdminReservationStatusSerializer(serializers.Serializer):
    status     = serializers.ChoiceField(choices=["confirmed", "rejected"])
    admin_note = serializers.CharField(required=False, allow_blank=True, default="")
