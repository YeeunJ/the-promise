from django.urls import path
from .views import (
    TeamListView,
    DepartmentListView,
    SpaceListView,
    SpaceAvailabilityView,
    SpaceReservationListView,
    ReservationListCreateView,
    ReservationTicketView,
    ReservationPublicCancelView,
    AdminLoginView,
    AdminReservationListView,
    AdminReservationCancelView,
    AdminReservationDeleteView,
)

urlpatterns = [
    path("teams/",                                     TeamListView.as_view()),
    path("departments/",                               DepartmentListView.as_view()),
    path("spaces/",                                    SpaceListView.as_view()),
    path("spaces/availability/",                       SpaceAvailabilityView.as_view()),
    path("spaces/<int:pk>/reservations/",              SpaceReservationListView.as_view()),
    path("reservations/",                              ReservationListCreateView.as_view()),
    path("reservations/<int:pk>/ticket/",              ReservationTicketView.as_view()),
    path("reservations/<int:pk>/cancel/",              ReservationPublicCancelView.as_view()),
    path("admin/login/",                               AdminLoginView.as_view()),
    path("admin/reservations/",                        AdminReservationListView.as_view()),
    path("admin/reservations/<int:pk>/cancel/",        AdminReservationCancelView.as_view()),
    path("admin/reservations/<int:pk>/",               AdminReservationDeleteView.as_view()),
]
