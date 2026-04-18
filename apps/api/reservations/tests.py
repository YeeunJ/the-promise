import datetime

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import Building, Department, Pastor, Reservation, Space, Team


class BaseTestCase(TestCase):
    """공통 픽스처 세팅"""

    def setUp(self):
        self.client = APIClient()

        self.building = Building.objects.create(name="본당", is_active=True)
        self.space = Space.objects.create(
            building=self.building,
            name="자람뜰홀",
            floor=1,
            capacity=50,
            is_active=True,
        )
        self.inactive_space = Space.objects.create(
            building=self.building,
            name="비활성공간",
            floor=1,
            capacity=10,
            is_active=False,
        )

        self.base_dept = Department.objects.create(name="청년부", display_order=7)
        self.base_team = Team.objects.create(
            name="디모데(1청년부)",
            department=self.base_dept,
            leader_phone="01098765432",
        )

        self.admin = User.objects.create_superuser(username="admin", password="admin1234")
        self.token = Token.objects.create(user=self.admin)

    def _make_dt(self, hour, minute=0, day=1):
        return timezone.make_aware(datetime.datetime(2030, 6, day, hour, minute))

    def _make_reservation(self, start_hour=10, end_hour=12, status=Reservation.Status.CONFIRMED,
                          day=1, space=None, **kwargs):
        defaults = dict(
            space=space or self.space,
            applicant_name="홍길동",
            applicant_phone="01012345678",
            team=self.base_team,
            leader_phone="01098765432",
            headcount=10,
            purpose="팀 모임",
            start_datetime=self._make_dt(start_hour, day=day),
            end_datetime=self._make_dt(end_hour, day=day),
            status=status,
        )
        defaults.update(kwargs)
        return Reservation.objects.create(**defaults)


# ─── 모델 ──────────────────────────────────────────────────────────────────────

class HasConflictTest(BaseTestCase):
    def test_no_conflict_when_no_reservations(self):
        r = Reservation(space=self.space, start_datetime=self._make_dt(10), end_datetime=self._make_dt(12))
        self.assertFalse(r.has_conflict())

    def test_conflict_when_time_overlaps(self):
        self._make_reservation(10, 12)
        r = Reservation(space=self.space, start_datetime=self._make_dt(11), end_datetime=self._make_dt(13))
        self.assertTrue(r.has_conflict())

    def test_no_conflict_adjacent_time(self):
        self._make_reservation(10, 12)
        r = Reservation(space=self.space, start_datetime=self._make_dt(12), end_datetime=self._make_dt(14))
        self.assertFalse(r.has_conflict())

    def test_no_conflict_with_rejected_reservation(self):
        self._make_reservation(10, 12, status=Reservation.Status.REJECTED)
        r = Reservation(space=self.space, start_datetime=self._make_dt(10), end_datetime=self._make_dt(12))
        self.assertFalse(r.has_conflict())

    def test_no_conflict_with_self(self):
        existing = self._make_reservation(10, 12)
        self.assertFalse(existing.has_conflict())

    def test_no_conflict_different_space(self):
        other = Space.objects.create(building=self.building, name="다른공간", is_active=True)
        self._make_reservation(10, 12)
        r = Reservation(space=other, start_datetime=self._make_dt(10), end_datetime=self._make_dt(12))
        self.assertFalse(r.has_conflict())

    def test_no_conflict_with_deleted_reservation(self):
        existing = self._make_reservation(10, 12)
        existing.is_deleted = True
        existing.save()
        r = Reservation(space=self.space, start_datetime=self._make_dt(10), end_datetime=self._make_dt(12))
        self.assertFalse(r.has_conflict())


# ─── 공개 API ──────────────────────────────────────────────────────────────────

class TeamListViewTest(BaseTestCase):
    """GET /api/v1/teams/"""

    def test_returns_active_teams(self):
        Team.objects.create(name="청년부", leader_phone="01012345678", is_active=True)
        Team.objects.create(name="찬양팀", leader_phone="01098765432", is_active=True)
        response = self.client.get("/api/v1/teams/")
        self.assertEqual(response.status_code, 200)
        # base_team(setUp) + 2 newly created = 3
        self.assertEqual(len(response.data), 3)

    def test_inactive_team_excluded(self):
        self._make_team("활성팀")
        self._make_team("비활성팀", is_active=False)
        response = self.client.get("/api/v1/teams/")
        names = [t["name"] for t in response.data]
        self.assertNotIn("비활성팀", names)

    def test_response_includes_leader_phone(self):
        Team.objects.all().delete()
        Team.objects.create(name="청년부", leader_phone="01012345678", is_active=True)
        response = self.client.get("/api/v1/teams/")
        self.assertIn("leader_phone", response.data[0])
        self.assertEqual(response.data[0]["leader_phone"], "01012345678")

    def test_returns_empty_when_no_teams(self):
        Team.objects.all().delete()
        response = self.client.get("/api/v1/teams/")
        self.assertEqual(response.data, [])

    def _make_team(self, name, is_active=True):
        return Team.objects.create(name=name, leader_phone="010-0000-0000", is_active=is_active)


class SpaceListViewTest(BaseTestCase):
    """GET /api/v1/spaces/"""

    def test_returns_active_buildings_and_spaces(self):
        response = self.client.get("/api/v1/spaces/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        space_names = [s["name"] for s in response.data[0]["spaces"]]
        self.assertIn("자람뜰홀", space_names)

    def test_inactive_space_excluded(self):
        response = self.client.get("/api/v1/spaces/")
        space_names = [s["name"] for s in response.data[0]["spaces"]]
        self.assertNotIn("비활성공간", space_names)

    def test_inactive_building_excluded(self):
        Building.objects.create(name="비활성건물", is_active=False)
        response = self.client.get("/api/v1/spaces/")
        names = [b["name"] for b in response.data]
        self.assertNotIn("비활성건물", names)


class ReservationCreateTest(BaseTestCase):
    """POST /api/v1/reservations/"""

    def _payload(self, start_hour=10, end_hour=12, start_minute=0, end_minute=0):
        return {
            "space": self.space.pk,
            "applicant_name": "홍길동",
            "applicant_phone": "01012345678",
            "team": self.base_team.pk,
            "leader_phone": "01098765432",
            "headcount": 10,
            "purpose": "팀 모임",
            "start_datetime": self._make_dt(start_hour, start_minute).isoformat(),
            "end_datetime": self._make_dt(end_hour, end_minute).isoformat(),
        }

    def test_confirmed_when_no_conflict(self):
        response = self.client.post("/api/v1/reservations/", self._payload(), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "confirmed")

    def test_rejected_when_conflict_exists(self):
        self._make_reservation(10, 12)
        response = self.client.post("/api/v1/reservations/", self._payload(11, 13), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "rejected")

    def test_validation_error_end_before_start(self):
        payload = self._payload()
        payload["end_datetime"] = self._make_dt(9).isoformat()
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_validation_error_not_30min_interval(self):
        payload = self._payload()
        payload["end_datetime"] = self._make_dt(10, 45).isoformat()
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_validation_error_inactive_space(self):
        payload = self._payload()
        payload["space"] = self.inactive_space.pk
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_validation_error_past_datetime(self):
        payload = self._payload()
        payload["start_datetime"] = "2020-01-01T10:00:00+09:00"
        payload["end_datetime"]   = "2020-01-01T12:00:00+09:00"
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirmed_even_if_deleted_reservation_exists(self):
        r = self._make_reservation(10, 12)
        r.is_deleted = True
        r.save()
        response = self.client.post("/api/v1/reservations/", self._payload(10, 12), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "confirmed")


class ReservationListViewTest(BaseTestCase):
    """GET /api/v1/reservations/"""

    def test_returns_reservations_by_name_and_phone(self):
        self._make_reservation()
        response = self.client.get("/api/v1/reservations/", {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_no_results_for_wrong_phone(self):
        self._make_reservation()
        response = self.client.get("/api/v1/reservations/", {"name": "홍길동", "phone": "01099999999"})
        self.assertEqual(len(response.data), 0)

    def test_400_when_params_missing(self):
        response = self.client.get("/api/v1/reservations/")
        self.assertEqual(response.status_code, 400)

    def test_deleted_reservation_not_returned(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get("/api/v1/reservations/", {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(len(response.data), 0)


class SpaceReservationListViewTest(BaseTestCase):
    """GET /api/v1/spaces/<id>/reservations/"""

    def test_returns_confirmed_reservations(self):
        self._make_reservation(10, 12)
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "2030-06-01"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_excludes_rejected(self):
        self._make_reservation(status=Reservation.Status.REJECTED)
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "2030-06-01"})
        self.assertEqual(len(response.data), 0)

    def test_400_when_date_missing(self):
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/")
        self.assertEqual(response.status_code, 400)

    def test_404_when_space_not_found(self):
        response = self.client.get("/api/v1/spaces/9999/reservations/", {"date": "2030-06-01"})
        self.assertEqual(response.status_code, 404)

    def test_400_when_date_invalid(self):
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "abc"})
        self.assertEqual(response.status_code, 400)


class SpaceAvailabilityViewTest(BaseTestCase):
    """GET /api/v1/spaces/availability/"""

    BASE_URL = "/api/v1/spaces/availability/"

    def _params(self, **kwargs):
        defaults = {
            "start_datetime": "2030-06-01T10:00:00+09:00",
            "end_datetime":   "2030-06-01T12:00:00+09:00",
            "show_unavailable": "Y",
        }
        defaults.update(kwargs)
        return defaults

    def _result_for(self, response, space_pk):
        return next(r for r in response.data if r["id"] == space_pk)

    def test_full_when_no_reservations(self):
        response = self.client.get(self.BASE_URL, self._params())
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "full")

    def test_partial_when_partially_overlapping(self):
        self._make_reservation(start_hour=9, end_hour=11)
        response = self.client.get(self.BASE_URL, self._params())
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "partial")

    def test_none_when_fully_blocked(self):
        self._make_reservation(start_hour=8, end_hour=14)
        response = self.client.get(self.BASE_URL, self._params())
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "none")

    def test_none_excluded_when_show_unavailable_N(self):
        self._make_reservation(start_hour=8, end_hour=14)
        response = self.client.get(self.BASE_URL, self._params(show_unavailable="N"))
        ids = [r["id"] for r in response.data]
        self.assertNotIn(self.space.pk, ids)

    def test_sorted_full_partial_none(self):
        sp = Space.objects.create(building=self.building, name="부분공간", floor=2, is_active=True)
        sn = Space.objects.create(building=self.building, name="차단공간", floor=3, is_active=True)
        self._make_reservation(start_hour=9, end_hour=11, space=sp)
        self._make_reservation(start_hour=8, end_hour=14, space=sn)
        response = self.client.get(self.BASE_URL, self._params())
        avail = [r["availability"] for r in response.data]
        self.assertLess(avail.index("full"), avail.index("partial"))
        self.assertLess(avail.index("partial"), avail.index("none"))

    def test_400_when_end_before_start(self):
        response = self.client.get(self.BASE_URL, self._params(
            start_datetime="2030-06-01T12:00:00+09:00",
            end_datetime="2030-06-01T10:00:00+09:00",
        ))
        self.assertEqual(response.status_code, 400)

    def test_inactive_space_excluded(self):
        response = self.client.get(self.BASE_URL, self._params())
        ids = [r["id"] for r in response.data]
        self.assertNotIn(self.inactive_space.pk, ids)


# ─── Admin 인증 ───────────────────────────────────────────────────────────────

class AdminLoginViewTest(BaseTestCase):
    def test_login_success(self):
        response = self.client.post("/api/v1/admin/login/",
                                    {"username": "admin", "password": "admin1234"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)

    def test_login_fail(self):
        response = self.client.post("/api/v1/admin/login/",
                                    {"username": "admin", "password": "wrong"}, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "unauthorized")


# ─── Admin Team CRUD ──────────────────────────────────────────────────────────

class AdminTeamTest(BaseTestCase):
    """GET·POST /admin/teams/  |  PATCH·DELETE /admin/teams/<pk>/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        self.dept = Department.objects.create(name="사역부", display_order=1)
        self.team = Team.objects.create(name="청년팀", department=self.dept, leader_phone="010-0000-0000")

    def test_list_includes_inactive(self):
        Team.objects.create(name="비활성팀", department=self.dept, leader_phone="010-0000-0000", is_active=False)
        response = self.client.get("/api/v1/admin/teams/")
        self.assertEqual(response.status_code, 200)
        names = [t["name"] for t in response.data]
        self.assertIn("비활성팀", names)

    def test_list_includes_department_and_leader_phone(self):
        response = self.client.get("/api/v1/admin/teams/")
        item = next(t for t in response.data if t["name"] == "청년팀")
        self.assertEqual(item["department"]["name"], "사역부")
        self.assertEqual(item["leader_phone"], "010-0000-0000")

    def test_create_team(self):
        response = self.client.post("/api/v1/admin/teams/",
                                    {"name": "신규팀", "department": self.dept.pk, "leader_phone": "010-1234-5678"},
                                    format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "신규팀")
        self.assertEqual(response.data["department"]["id"], self.dept.pk)

    def test_create_team_missing_name_400(self):
        response = self.client.post("/api/v1/admin/teams/",
                                    {"department": self.dept.pk, "leader_phone": "010-0000-0000"},
                                    format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_create_team_duplicate_name_same_department_400(self):
        response = self.client.post("/api/v1/admin/teams/",
                                    {"name": "청년팀", "department": self.dept.pk, "leader_phone": "010-0000-0000"},
                                    format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_patch_team(self):
        response = self.client.patch(f"/api/v1/admin/teams/{self.team.pk}/",
                                     {"name": "수정된팀"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "수정된팀")

    def test_patch_team_not_found(self):
        response = self.client.patch("/api/v1/admin/teams/9999/",
                                     {"name": "없음"}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_soft_delete_team(self):
        response = self.client.delete(f"/api/v1/admin/teams/{self.team.pk}/")
        self.assertEqual(response.status_code, 204)
        self.team.refresh_from_db()
        self.assertFalse(self.team.is_active)

    def test_soft_delete_not_found(self):
        response = self.client.delete("/api/v1/admin/teams/9999/")
        self.assertEqual(response.status_code, 404)

    def test_401_without_token(self):
        self.client.credentials()
        response = self.client.get("/api/v1/admin/teams/")
        self.assertEqual(response.status_code, 401)


# ─── Admin Building CRUD ──────────────────────────────────────────────────────

class AdminBuildingTest(BaseTestCase):
    """GET·POST /admin/buildings/  |  PATCH·DELETE /admin/buildings/<pk>/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_list_includes_inactive(self):
        Building.objects.create(name="비활성건물", is_active=False)
        response = self.client.get("/api/v1/admin/buildings/")
        names = [b["name"] for b in response.data]
        self.assertIn("비활성건물", names)

    def test_create_building(self):
        response = self.client.post("/api/v1/admin/buildings/",
                                    {"name": "신관", "description": "새 건물"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "신관")

    def test_create_building_missing_name_400(self):
        response = self.client.post("/api/v1/admin/buildings/",
                                    {"description": "설명만"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_patch_building(self):
        response = self.client.patch(f"/api/v1/admin/buildings/{self.building.pk}/",
                                     {"name": "수정된건물"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "수정된건물")

    def test_patch_not_found(self):
        response = self.client.patch("/api/v1/admin/buildings/9999/",
                                     {"name": "없음"}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_soft_delete_building_with_no_active_spaces(self):
        building = Building.objects.create(name="빈건물")
        response = self.client.delete(f"/api/v1/admin/buildings/{building.pk}/")
        self.assertEqual(response.status_code, 204)
        building.refresh_from_db()
        self.assertFalse(building.is_active)

    def test_soft_delete_building_with_active_spaces_400(self):
        # self.building에는 self.space(is_active=True)가 있음
        response = self.client.delete(f"/api/v1/admin/buildings/{self.building.pk}/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "conflict")

    def test_soft_delete_not_found(self):
        response = self.client.delete("/api/v1/admin/buildings/9999/")
        self.assertEqual(response.status_code, 404)

    def test_401_without_token(self):
        self.client.credentials()
        response = self.client.get("/api/v1/admin/buildings/")
        self.assertEqual(response.status_code, 401)


# ─── Admin Space CRUD ─────────────────────────────────────────────────────────

class AdminSpaceTest(BaseTestCase):
    """GET·POST /admin/spaces/  |  PATCH·DELETE /admin/spaces/<pk>/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_list_includes_inactive_and_all_buildings(self):
        response = self.client.get("/api/v1/admin/spaces/")
        self.assertEqual(response.status_code, 200)
        ids = [s["id"] for s in response.data]
        self.assertIn(self.space.pk, ids)
        self.assertIn(self.inactive_space.pk, ids)

    def test_list_includes_nested_building(self):
        response = self.client.get("/api/v1/admin/spaces/")
        item = next(s for s in response.data if s["id"] == self.space.pk)
        self.assertEqual(item["building"]["name"], "본당")

    def test_create_space(self):
        response = self.client.post("/api/v1/admin/spaces/",
                                    {"building": self.building.pk, "name": "신규공간",
                                     "floor": 3, "capacity": 30},
                                    format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "신규공간")
        self.assertEqual(response.data["building"]["id"], self.building.pk)

    def test_create_space_missing_required_400(self):
        response = self.client.post("/api/v1/admin/spaces/",
                                    {"floor": 1}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_patch_space(self):
        response = self.client.patch(f"/api/v1/admin/spaces/{self.space.pk}/",
                                     {"name": "수정된공간", "capacity": 100}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "수정된공간")
        self.assertEqual(response.data["capacity"], 100)

    def test_patch_not_found(self):
        response = self.client.patch("/api/v1/admin/spaces/9999/",
                                     {"name": "없음"}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_soft_delete_space(self):
        response = self.client.delete(f"/api/v1/admin/spaces/{self.space.pk}/")
        self.assertEqual(response.status_code, 204)
        self.space.refresh_from_db()
        self.assertFalse(self.space.is_active)

    def test_soft_delete_not_found(self):
        response = self.client.delete("/api/v1/admin/spaces/9999/")
        self.assertEqual(response.status_code, 404)

    def test_401_without_token(self):
        self.client.credentials()
        response = self.client.get("/api/v1/admin/spaces/")
        self.assertEqual(response.status_code, 401)


# ─── Admin Reservation 기존 ────────────────────────────────────────────────────

class AdminReservationListViewTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_returns_all_with_token(self):
        self._make_reservation()
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_401_without_token(self):
        self.client.credentials()
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(response.status_code, 401)

    def test_filter_by_date(self):
        self._make_reservation(day=1)
        self._make_reservation(start_hour=14, end_hour=16, day=2)
        response = self.client.get("/api/v1/admin/reservations/", {"date": "2030-06-01"})
        self.assertEqual(len(response.data), 1)

    def test_filter_by_status(self):
        self._make_reservation(status=Reservation.Status.CONFIRMED)
        self._make_reservation(start_hour=14, end_hour=16, status=Reservation.Status.CANCELLED)
        response = self.client.get("/api/v1/admin/reservations/", {"status": "confirmed"})
        self.assertEqual(len(response.data), 1)

    def test_deleted_not_returned(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(len(response.data), 0)

    def test_400_invalid_date_format(self):
        response = self.client.get("/api/v1/admin/reservations/", {"date": "abc"})
        self.assertEqual(response.status_code, 400)


class AdminReservationDetailViewTest(BaseTestCase):
    """GET /api/v1/admin/reservations/<pk>/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_get_detail(self):
        r = self._make_reservation()
        response = self.client.get(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], r.pk)
        self.assertEqual(response.data["applicant_name"], "홍길동")

    def test_get_deleted_returns_404(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "not_found")

    def test_get_not_found(self):
        response = self.client.get("/api/v1/admin/reservations/9999/")
        self.assertEqual(response.status_code, 404)

    def test_401_without_token(self):
        self.client.credentials()
        r = self._make_reservation()
        response = self.client.get(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 401)


class AdminReservationStatusViewTest(BaseTestCase):
    """PATCH /api/v1/admin/reservations/<pk>/status/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_pending_to_confirmed(self):
        r = self._make_reservation(status=Reservation.Status.PENDING)
        response = self.client.patch(f"/api/v1/admin/reservations/{r.pk}/status/",
                                     {"status": "confirmed"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "confirmed")

    def test_pending_to_rejected(self):
        r = self._make_reservation(status=Reservation.Status.PENDING)
        response = self.client.patch(f"/api/v1/admin/reservations/{r.pk}/status/",
                                     {"status": "rejected", "admin_note": "사유"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "rejected")
        self.assertEqual(response.data["admin_note"], "사유")

    def test_non_pending_returns_400(self):
        r = self._make_reservation(status=Reservation.Status.CONFIRMED)
        response = self.client.patch(f"/api/v1/admin/reservations/{r.pk}/status/",
                                     {"status": "rejected"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "invalid_status_transition")

    def test_confirmed_with_conflict_returns_400(self):
        # 이미 confirmed 예약이 있는 시간대에 pending→confirmed 시도
        self._make_reservation(10, 12, status=Reservation.Status.CONFIRMED)
        r = self._make_reservation(10, 12, status=Reservation.Status.PENDING)
        response = self.client.patch(f"/api/v1/admin/reservations/{r.pk}/status/",
                                     {"status": "confirmed"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "conflict")

    def test_invalid_status_value_400(self):
        r = self._make_reservation(status=Reservation.Status.PENDING)
        response = self.client.patch(f"/api/v1/admin/reservations/{r.pk}/status/",
                                     {"status": "cancelled"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_not_found_404(self):
        response = self.client.patch("/api/v1/admin/reservations/9999/status/",
                                     {"status": "confirmed"}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_401_without_token(self):
        self.client.credentials()
        r = self._make_reservation(status=Reservation.Status.PENDING)
        response = self.client.patch(f"/api/v1/admin/reservations/{r.pk}/status/",
                                     {"status": "confirmed"}, format="json")
        self.assertEqual(response.status_code, 401)


class AdminReservationDeleteViewTest(BaseTestCase):
    """DELETE /api/v1/admin/reservations/<pk>/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_soft_delete(self):
        r = self._make_reservation()
        response = self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 204)
        r.refresh_from_db()
        self.assertTrue(r.is_deleted)
        self.assertIsNotNone(r.deleted_at)

    def test_already_deleted_returns_404(self):
        r = self._make_reservation()
        self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        response = self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 404)

    def test_not_found(self):
        response = self.client.delete("/api/v1/admin/reservations/9999/")
        self.assertEqual(response.status_code, 404)

    def test_401_without_token(self):
        self.client.credentials()
        r = self._make_reservation()
        response = self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 401)


class AdminReservationCancelViewTest(BaseTestCase):
    """POST /api/v1/admin/reservations/<pk>/cancel/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_cancel_success(self):
        r = self._make_reservation()
        response = self.client.post(f"/api/v1/admin/reservations/{r.pk}/cancel/",
                                    {"admin_note": "테스트 취소"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "cancelled")

    def test_already_cancelled_400(self):
        r = self._make_reservation(status=Reservation.Status.CANCELLED)
        response = self.client.post(f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "already_cancelled")

    def test_rejected_cannot_cancel_400(self):
        r = self._make_reservation(status=Reservation.Status.REJECTED)
        response = self.client.post(f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "cannot_cancel_rejected")

    def test_not_found_404(self):
        response = self.client.post("/api/v1/admin/reservations/9999/cancel/", {}, format="json")
        self.assertEqual(response.status_code, 404)


# ─── 티켓 ─────────────────────────────────────────────────────────────────────

class ReservationTicketViewTest(BaseTestCase):
    def test_returns_png(self):
        r = self._make_reservation()
        response = self.client.get(f"/api/v1/reservations/{r.pk}/ticket/",
                                   {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/png")
        self.assertTrue(response.content.startswith(b"\x89PNG"))

    def test_403_name_mismatch(self):
        r = self._make_reservation()
        response = self.client.get(f"/api/v1/reservations/{r.pk}/ticket/",
                                   {"name": "김철수", "phone": "01012345678"})
        self.assertEqual(response.status_code, 403)

    def test_400_missing_params(self):
        r = self._make_reservation()
        response = self.client.get(f"/api/v1/reservations/{r.pk}/ticket/",
                                   {"name": "홍길동"})
        self.assertEqual(response.status_code, 400)

    def test_404_not_found(self):
        response = self.client.get("/api/v1/reservations/9999/ticket/",
                                   {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.status_code, 404)
