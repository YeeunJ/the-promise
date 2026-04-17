from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import Building, Space, Reservation, Team, Department, Pastor


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name", "leader_phone"]


class PastorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pastor
        fields = ["id", "name", "title"]


class TeamNestedSerializer(serializers.ModelSerializer):
    pastor = PastorSerializer(read_only=True)
    pastor_display = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ["id", "name", "pastor", "pastor_display"]

    def get_pastor_display(self, obj: Team) -> str | None:
        return obj.get_pastor_display()


class DepartmentSerializer(serializers.ModelSerializer):
    pastor = PastorSerializer(read_only=True)
    teams = TeamNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "display_order", "pastor", "teams"]


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
