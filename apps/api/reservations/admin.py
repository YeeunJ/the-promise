from django.contrib import admin
from .models import Building, Department, Pastor, Space, Reservation, Team


@admin.register(Pastor)
class PastorAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "title", "is_active"]
    list_filter  = ["is_active", "title"]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "pastor", "display_order", "is_active"]
    list_filter  = ["is_active"]


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "department", "pastor", "is_active"]
    list_filter  = ["department", "is_active"]


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
    list_display  = ["id", "space", "applicant_name", "team", "status", "start_datetime", "end_datetime"]
    list_filter   = ["status", "space__building"]
    search_fields = ["applicant_name", "applicant_phone", "custom_team_name"]
