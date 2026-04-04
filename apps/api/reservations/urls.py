from django.urls import path
from .views import (
    SpaceListView,
    SpaceReservationListView,
    ReservationListCreateView,
    AdminLoginView,
    AdminReservationListView,
    AdminReservationCancelView,
)

urlpatterns = [
    path("spaces/",                               SpaceListView.as_view()),
    path("spaces/<int:pk>/reservations/",         SpaceReservationListView.as_view()),
    path("reservations/",                         ReservationListCreateView.as_view()),
    path("admin/login/",                          AdminLoginView.as_view()),
    path("admin/reservations/",                   AdminReservationListView.as_view()),
    path("admin/reservations/<int:pk>/cancel/",   AdminReservationCancelView.as_view()),
]
