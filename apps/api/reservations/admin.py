from django.contrib import admin
from .models import Building, Space, Reservation


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "is_active", "created_at"]
    list_filter  = ["is_active"]


@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ["id", "building", "name", "floor", "capacity", "is_active"]
    list_filter  = ["building", "is_active"]


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display  = ["id", "space", "applicant_name", "applicant_team", "status", "start_datetime", "end_datetime"]
    list_filter   = ["status", "space__building"]
    search_fields = ["applicant_name", "applicant_phone", "applicant_team"]
