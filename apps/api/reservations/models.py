from django.db import models
from django.utils import timezone


class Team(models.Model):
    name         = models.CharField(max_length=100, unique=True)
    leader_phone = models.CharField(max_length=20)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "teams"

    def __str__(self):
        return self.name


class Building(models.Model):
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "buildings"

    def __str__(self):
        return self.name


class Space(models.Model):
    building    = models.ForeignKey(Building, on_delete=models.PROTECT, related_name="spaces")
    name        = models.CharField(max_length=100)
    floor       = models.IntegerField(blank=True, null=True)
    capacity    = models.IntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "spaces"

    def __str__(self):
        return f"{self.building.name} - {self.name}"


class Reservation(models.Model):

    class Status(models.TextChoices):
        PENDING   = "pending",   "대기 중"
        CONFIRMED = "confirmed", "승인됨"
        REJECTED  = "rejected",  "거절됨"
        CANCELLED = "cancelled", "취소됨"

    space           = models.ForeignKey(Space, on_delete=models.PROTECT, related_name="reservations")
    applicant_name  = models.CharField(max_length=50)
    applicant_phone = models.CharField(max_length=20)
    applicant_team  = models.CharField(max_length=100)
    leader_phone    = models.CharField(max_length=20)
    headcount       = models.PositiveIntegerField()
    purpose         = models.TextField()
    start_datetime  = models.DateTimeField()
    end_datetime    = models.DateTimeField()
    status          = models.CharField(
                          max_length=20,
                          choices=Status.choices,
                          default=Status.CONFIRMED,
                      )
    admin_note      = models.TextField(blank=True, null=True)
    is_deleted      = models.BooleanField(default=False)
    deleted_at      = models.DateTimeField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reservations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["applicant_name", "applicant_phone"]),
            models.Index(fields=["space", "start_datetime", "end_datetime"]),
        ]

    def __str__(self):
        return f"{self.applicant_name} - {self.space} ({self.start_datetime:%Y-%m-%d %H:%M})"

    def has_conflict(self) -> bool:
        """
        같은 공간에 시간이 겹치는 confirmed 예약이 존재하면 True.
        판단 기준: 신청 시작 < 기존 종료 AND 신청 종료 > 기존 시작
        """
        qs = Reservation.objects.filter(
            space=self.space,
            status=Reservation.Status.CONFIRMED,
            is_deleted=False,
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime,
        )
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        return qs.exists()
