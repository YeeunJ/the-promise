import datetime

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import Building, Department, Pastor, Reservation, Space, Team


class BaseTestCase(TestCase):
    """공통 픽스처 세팅 (현재 스키마: Pastor / Department / Team)."""

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

        self.pastor = Pastor.objects.create(
            name="홍길동", title="목사", phone="010-0000-0000"
        )
        self.department = Department.objects.create(
            name="청년부", display_order=1, pastor=self.pastor, is_active=True
        )
        self.team = Team.objects.create(
            name="청년1팀",
            department=self.department,
            pastor=self.pastor,
            leader_phone="010-1111-2222",
            is_active=True,
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
            custom_team_name="청년부",
            leader_phone="01098765432",
            headcount=10,
            purpose="팀 모임",
            start_datetime=self._make_dt(start_hour, day=day),
            end_datetime=self._make_dt(end_hour, day=day),
            status=status,
        )
        defaults.update(kwargs)
        return Reservation.objects.create(**defaults)

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")


# ─── 모델: Reservation.has_conflict ───────────────────────────────────────────

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


# ─── 모델: Team.get_pastor_display ────────────────────────────────────────────

class TeamPastorDisplayTest(BaseTestCase):
    def test_uses_team_pastor_when_set(self):
        # Arrange: team.pastor가 직접 지정됨
        # Act / Assert
        self.assertEqual(self.team.get_pastor_display(), "홍길동 목사")

    def test_falls_back_to_department_pastor(self):
        dept_pastor = Pastor.objects.create(name="이순신", title="전도사", phone="010-2222-3333")
        dept = Department.objects.create(name="장년부", display_order=2, pastor=dept_pastor)
        team = Team.objects.create(
            name="장년1팀", department=dept, pastor=None, leader_phone="010-0000-0001"
        )
        self.assertEqual(team.get_pastor_display(), "이순신 전도사")

    def test_returns_none_when_no_pastor(self):
        dept = Department.objects.create(name="유아부", display_order=3, pastor=None)
        team = Team.objects.create(
            name="유아1팀", department=dept, pastor=None, leader_phone="010-0000-0002"
        )
        self.assertIsNone(team.get_pastor_display())


# ─── 공개 API: GET /api/v1/teams/ ─────────────────────────────────────────────

class TeamListViewTest(BaseTestCase):
    def _make_team(self, name, is_active=True):
        return Team.objects.create(
            name=name,
            department=self.department,
            pastor=self.pastor,
            leader_phone="010-3333-4444",
            is_active=is_active,
        )

    def test_returns_active_teams(self):
        # setUp의 self.team(청년1팀) + 추가 1팀 = 2
        self._make_team("청년2팀")
        response = self.client.get("/api/v1/teams/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_inactive_team_excluded(self):
        self._make_team("비활성팀", is_active=False)
        response = self.client.get("/api/v1/teams/")
        names = [t["name"] for t in response.data]
        self.assertNotIn("비활성팀", names)

    def test_response_includes_expected_fields(self):
        response = self.client.get("/api/v1/teams/")
        item = response.data[0]
        self.assertIn("id", item)
        self.assertIn("name", item)
        self.assertIn("leader_phone", item)

    def test_returns_empty_when_no_active_teams(self):
        Team.objects.update(is_active=False)
        response = self.client.get("/api/v1/teams/")
        self.assertEqual(response.data, [])


# ─── 공개 API: GET /api/v1/departments/ ───────────────────────────────────────

class DepartmentListViewTest(BaseTestCase):
    """비활성 팀 제외 검증은 test_department_inactive_team.py가 담당하므로
    여기서는 부서/목사 메타와 활성 부서 필터만 검증한다."""

    def test_returns_active_departments_with_pastor_and_teams(self):
        response = self.client.get("/api/v1/departments/")
        self.assertEqual(response.status_code, 200)
        dept = next(d for d in response.data if d["name"] == "청년부")
        self.assertEqual(dept["pastor"]["name"], "홍길동")
        self.assertIn("teams", dept)
        team = next(t for t in dept["teams"] if t["name"] == "청년1팀")
        self.assertEqual(team["pastor_display"], "홍길동 목사")

    def test_inactive_department_excluded(self):
        Department.objects.create(name="비활성부서", display_order=99, is_active=False)
        response = self.client.get("/api/v1/departments/")
        names = [d["name"] for d in response.data]
        self.assertNotIn("비활성부서", names)


# ─── 공개 API: GET /api/v1/spaces/ ────────────────────────────────────────────

class SpaceListViewTest(BaseTestCase):
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


# ─── 공개 API: POST /api/v1/reservations/ ─────────────────────────────────────

class ReservationCreateTest(BaseTestCase):
    def _payload(self, start_hour=10, end_hour=12, start_minute=0, end_minute=0):
        return {
            "space": self.space.pk,
            "applicant_name": "홍길동",
            "applicant_phone": "01012345678",
            "custom_team_name": "청년부",
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

    def test_create_with_team_fk(self):
        payload = self._payload()
        payload.pop("custom_team_name")
        payload["team"] = self.team.pk
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["team"], self.team.pk)
        # applicant_team(SerializerMethodField)은 team.name을 반환
        self.assertEqual(response.data["applicant_team"], "청년1팀")

    def test_applicant_team_falls_back_to_custom_name(self):
        response = self.client.post("/api/v1/reservations/", self._payload(), format="json")
        self.assertEqual(response.data["applicant_team"], "청년부")

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
        self.assertEqual(response.data["error"], "validation_error")

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


# ─── 공개 API: GET /api/v1/reservations/ (페이징) ──────────────────────────────

class ReservationListViewTest(BaseTestCase):
    def test_returns_reservations_by_name_and_phone(self):
        self._make_reservation()
        response = self.client.get("/api/v1/reservations/", {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)

    def test_no_results_for_wrong_phone(self):
        self._make_reservation()
        response = self.client.get("/api/v1/reservations/", {"name": "홍길동", "phone": "01099999999"})
        self.assertEqual(response.data["count"], 0)

    def test_400_when_params_missing(self):
        response = self.client.get("/api/v1/reservations/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_deleted_reservation_not_returned(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get("/api/v1/reservations/", {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.data["count"], 0)


# ─── 공개 API: 현재/지난 예약 (페이징) ─────────────────────────────────────────

class ReservationCurrentPastListViewTest(BaseTestCase):
    """GET /api/v1/reservations/current/ , /past/ — now 기준 분리."""

    def _make_future(self):
        start = timezone.now() + datetime.timedelta(days=2)
        return Reservation.objects.create(
            space=self.space, applicant_name="홍길동", applicant_phone="01012345678",
            custom_team_name="청년부", leader_phone="01098765432", headcount=5,
            purpose="모임", start_datetime=start, end_datetime=start + datetime.timedelta(hours=1),
            status=Reservation.Status.CONFIRMED,
        )

    def _make_past(self):
        end = timezone.now() - datetime.timedelta(days=2)
        return Reservation.objects.create(
            space=self.space, applicant_name="홍길동", applicant_phone="01012345678",
            custom_team_name="청년부", leader_phone="01098765432", headcount=5,
            purpose="모임", start_datetime=end - datetime.timedelta(hours=1), end_datetime=end,
            status=Reservation.Status.CONFIRMED,
        )

    def test_current_returns_future_only(self):
        self._make_future()
        self._make_past()
        response = self.client.get("/api/v1/reservations/current/", {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_past_returns_past_only(self):
        self._make_future()
        self._make_past()
        response = self.client.get("/api/v1/reservations/past/", {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_400_when_params_missing(self):
        response = self.client.get("/api/v1/reservations/current/")
        self.assertEqual(response.status_code, 400)


# ─── 공개 API: GET /api/v1/spaces/<id>/reservations/ ──────────────────────────

class SpaceReservationListViewTest(BaseTestCase):
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


# ─── 공개 API: GET /api/v1/spaces/availability/ ───────────────────────────────

class SpaceAvailabilityViewTest(BaseTestCase):
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
        self.assertEqual(response.data["error"], "validation_error")

    def test_inactive_space_excluded(self):
        response = self.client.get(self.BASE_URL, self._params())
        ids = [r["id"] for r in response.data]
        self.assertNotIn(self.inactive_space.pk, ids)

    def test_filter_by_building(self):
        other_building = Building.objects.create(name="별관", is_active=True)
        other_space = Space.objects.create(building=other_building, name="별관공간", is_active=True)
        response = self.client.get(self.BASE_URL, self._params(building_id=other_building.pk))
        ids = [r["id"] for r in response.data]
        self.assertIn(other_space.pk, ids)
        self.assertNotIn(self.space.pk, ids)


# ─── 공개 API: POST /api/v1/reservations/<pk>/cancel/ ─────────────────────────

class ReservationPublicCancelViewTest(BaseTestCase):
    def test_cancel_success(self):
        r = self._make_reservation()
        response = self.client.post(
            f"/api/v1/reservations/{r.pk}/cancel/",
            {"name": "홍길동", "phone": "01012345678"}, format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "cancelled")

    def test_400_when_params_missing(self):
        r = self._make_reservation()
        response = self.client.post(f"/api/v1/reservations/{r.pk}/cancel/", {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_403_when_identity_mismatch(self):
        r = self._make_reservation()
        response = self.client.post(
            f"/api/v1/reservations/{r.pk}/cancel/",
            {"name": "김철수", "phone": "01012345678"}, format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["error"], "forbidden")

    def test_404_when_not_found(self):
        response = self.client.post(
            "/api/v1/reservations/9999/cancel/",
            {"name": "홍길동", "phone": "01012345678"}, format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_400_already_cancelled(self):
        r = self._make_reservation(status=Reservation.Status.CANCELLED)
        response = self.client.post(
            f"/api/v1/reservations/{r.pk}/cancel/",
            {"name": "홍길동", "phone": "01012345678"}, format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "already_cancelled")

    def test_400_cannot_cancel_rejected(self):
        r = self._make_reservation(status=Reservation.Status.REJECTED)
        response = self.client.post(
            f"/api/v1/reservations/{r.pk}/cancel/",
            {"name": "홍길동", "phone": "01012345678"}, format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "cannot_cancel_rejected")


# ─── 공개 API: GET /api/v1/reservations/<pk>/ticket/ ──────────────────────────

class ReservationTicketViewTest(BaseTestCase):
    """티켓 이미지 본문 생성 자체는 test_ticket_image.py가 담당하므로,
    여기서는 엔드포인트의 인증/검증/응답 형식을 검증한다."""

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
        response = self.client.get(f"/api/v1/reservations/{r.pk}/ticket/", {"name": "홍길동"})
        self.assertEqual(response.status_code, 400)

    def test_404_not_found(self):
        response = self.client.get("/api/v1/reservations/9999/ticket/",
                                   {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(response.status_code, 404)


# ─── Admin 인증: POST /api/v1/admin/login/ ────────────────────────────────────

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
        self._auth()

    def test_list_includes_inactive(self):
        Team.objects.create(
            name="비활성팀", department=self.department, leader_phone="010-0000-0000", is_active=False
        )
        response = self.client.get("/api/v1/admin/teams/")
        self.assertEqual(response.status_code, 200)
        names = [t["name"] for t in response.data]
        self.assertIn("비활성팀", names)

    def test_list_includes_department_and_pastor(self):
        response = self.client.get("/api/v1/admin/teams/")
        item = next(t for t in response.data if t["name"] == "청년1팀")
        self.assertEqual(item["department"]["name"], "청년부")
        self.assertEqual(item["pastor"]["name"], "홍길동")
        self.assertIn("leader_phone", item)

    def test_create_team(self):
        response = self.client.post(
            "/api/v1/admin/teams/",
            {"name": "신규팀", "department": self.department.pk,
             "pastor": self.pastor.pk, "leader_phone": "010-5555-6666"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "신규팀")
        self.assertEqual(response.data["department"]["id"], self.department.pk)
        self.assertEqual(response.data["pastor"]["id"], self.pastor.pk)

    def test_create_team_missing_name_400(self):
        response = self.client.post(
            "/api/v1/admin/teams/",
            {"department": self.department.pk, "leader_phone": "010-0000-0000"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_create_team_duplicate_name_in_department_400(self):
        # unique_together = (department, name): 같은 부서에 "청년1팀" 중복
        response = self.client.post(
            "/api/v1/admin/teams/",
            {"name": "청년1팀", "department": self.department.pk, "leader_phone": "010-0000-0000"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_patch_team(self):
        response = self.client.patch(f"/api/v1/admin/teams/{self.team.pk}/",
                                     {"name": "수정된팀"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "수정된팀")

    def test_patch_team_not_found(self):
        response = self.client.patch("/api/v1/admin/teams/9999/", {"name": "없음"}, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "not_found")

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
        self._auth()

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
        response = self.client.patch("/api/v1/admin/buildings/9999/", {"name": "없음"}, format="json")
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
        self._auth()

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
        response = self.client.post("/api/v1/admin/spaces/", {"floor": 1}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_patch_space(self):
        response = self.client.patch(f"/api/v1/admin/spaces/{self.space.pk}/",
                                     {"name": "수정된공간", "capacity": 100}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "수정된공간")
        self.assertEqual(response.data["capacity"], 100)

    def test_patch_not_found(self):
        response = self.client.patch("/api/v1/admin/spaces/9999/", {"name": "없음"}, format="json")
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


# ─── Admin Reservation 목록 (페이징) ───────────────────────────────────────────

class AdminReservationListViewTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self._auth()

    def test_returns_all_with_token(self):
        self._make_reservation()
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_401_without_token(self):
        self.client.credentials()
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(response.status_code, 401)

    def test_filter_by_date_range(self):
        self._make_reservation(day=1)
        self._make_reservation(start_hour=14, end_hour=16, day=2)
        response = self.client.get(
            "/api/v1/admin/reservations/",
            {"from_date": "2030-06-01", "to_date": "2030-06-01"},
        )
        self.assertEqual(response.data["count"], 1)

    def test_filter_by_status(self):
        self._make_reservation(status=Reservation.Status.CONFIRMED)
        self._make_reservation(start_hour=14, end_hour=16, status=Reservation.Status.CANCELLED)
        response = self.client.get("/api/v1/admin/reservations/", {"status": "confirmed"})
        self.assertEqual(response.data["count"], 1)

    def test_search_by_applicant_name(self):
        self._make_reservation()
        self._make_reservation(start_hour=14, end_hour=16, applicant_name="김철수")
        response = self.client.get("/api/v1/admin/reservations/", {"search": "김철수"})
        self.assertEqual(response.data["count"], 1)

    def test_search_phone_with_hyphen_matches_stored_without_hyphen(self):
        # DB에는 하이픈 없이 저장(01012345678), 검색어에는 하이픈 포함.
        self._make_reservation(applicant_phone="01012345678")
        self._make_reservation(start_hour=14, end_hour=16, applicant_phone="01099998888")
        response = self.client.get(
            "/api/v1/admin/reservations/", {"search": "010-1234-5678"}
        )
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["applicant_phone"], "01012345678")

    def test_search_phone_without_hyphen_matches_stored_with_hyphen(self):
        # DB에 하이픈 포함 저장, 검색어에는 하이픈 없음.
        self._make_reservation(applicant_phone="010-1234-5678")
        self._make_reservation(start_hour=14, end_hour=16, applicant_phone="01099998888")
        response = self.client.get(
            "/api/v1/admin/reservations/", {"search": "01012345678"}
        )
        self.assertEqual(response.data["count"], 1)

    def test_search_partial_phone_digits(self):
        self._make_reservation(applicant_phone="01012345678")
        self._make_reservation(start_hour=14, end_hour=16, applicant_phone="01099998888")
        response = self.client.get("/api/v1/admin/reservations/", {"search": "1234"})
        self.assertEqual(response.data["count"], 1)

    def test_ordering_by_headcount_ascending(self):
        self._make_reservation(headcount=30)
        self._make_reservation(start_hour=14, end_hour=16, headcount=5)
        response = self.client.get(
            "/api/v1/admin/reservations/", {"ordering": "headcount"}
        )
        headcounts = [r["headcount"] for r in response.data["results"]]
        self.assertEqual(headcounts, [5, 30])

    def test_ordering_by_applicant_name_descending(self):
        self._make_reservation(applicant_name="가나")
        self._make_reservation(start_hour=14, end_hour=16, applicant_name="하늘")
        response = self.client.get(
            "/api/v1/admin/reservations/", {"ordering": "-applicant_name"}
        )
        names = [r["applicant_name"] for r in response.data["results"]]
        self.assertEqual(names, ["하늘", "가나"])

    def test_ordering_invalid_falls_back_to_default(self):
        self._make_reservation(day=1)
        self._make_reservation(start_hour=14, end_hour=16, day=2)
        response = self.client.get(
            "/api/v1/admin/reservations/", {"ordering": "evil; DROP TABLE"}
        )
        self.assertEqual(response.status_code, 200)
        # 기본 정렬 -start_datetime (최신 우선)
        dates = [r["start_datetime"][:10] for r in response.data["results"]]
        self.assertEqual(dates, sorted(dates, reverse=True))

    def test_deleted_not_returned(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(response.data["count"], 0)

    def test_400_invalid_from_date_format(self):
        response = self.client.get("/api/v1/admin/reservations/", {"from_date": "abc"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")


# ─── Admin Reservation 현재/지난 ───────────────────────────────────────────────

class AdminReservationCurrentPastListViewTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self._auth()

    def _make_future(self):
        start = timezone.now() + datetime.timedelta(days=2)
        return Reservation.objects.create(
            space=self.space, applicant_name="홍길동", applicant_phone="01012345678",
            custom_team_name="청년부", leader_phone="01098765432", headcount=5,
            purpose="모임", start_datetime=start, end_datetime=start + datetime.timedelta(hours=1),
            status=Reservation.Status.CONFIRMED,
        )

    def _make_past(self):
        end = timezone.now() - datetime.timedelta(days=2)
        return Reservation.objects.create(
            space=self.space, applicant_name="홍길동", applicant_phone="01012345678",
            custom_team_name="청년부", leader_phone="01098765432", headcount=5,
            purpose="모임", start_datetime=end - datetime.timedelta(hours=1), end_datetime=end,
            status=Reservation.Status.CONFIRMED,
        )

    def test_current_returns_future_only(self):
        self._make_future()
        self._make_past()
        response = self.client.get("/api/v1/admin/reservations/current/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_past_returns_past_only(self):
        self._make_future()
        self._make_past()
        response = self.client.get("/api/v1/admin/reservations/past/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_401_without_token(self):
        self.client.credentials()
        response = self.client.get("/api/v1/admin/reservations/current/")
        self.assertEqual(response.status_code, 401)


# ─── Admin Reservation 상세 (GET /admin/reservations/<pk>/) ───────────────────

class AdminReservationDetailViewTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self._auth()

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


# ─── Admin Reservation 상태 변경 (PATCH .../status/) ──────────────────────────

class AdminReservationStatusViewTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self._auth()

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


# ─── Admin Reservation 소프트 삭제 (DELETE .../<pk>/) ─────────────────────────

class AdminReservationDeleteViewTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self._auth()

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


# ─── Admin Reservation 취소 (POST .../cancel/) ────────────────────────────────

class AdminReservationCancelViewTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self._auth()

    def test_cancel_success(self):
        r = self._make_reservation()
        response = self.client.post(f"/api/v1/admin/reservations/{r.pk}/cancel/",
                                    {"admin_note": "테스트 취소"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "cancelled")
        self.assertEqual(response.data["admin_note"], "테스트 취소")

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

    def test_401_without_token(self):
        self.client.credentials()
        r = self._make_reservation()
        response = self.client.post(f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json")
        self.assertEqual(response.status_code, 401)


# ─── 실시간 예약 현황 보드 ──────────────────────────────────────────────────────

class ReservationBoardViewTest(BaseTestCase):
    """GET /api/v1/reservations/board/ — 현재 진행 중 + 2시간 내 시작 예약(건물별)."""

    URL = "/api/v1/reservations/board/"

    def _rel(self, start_min, end_min, space=None,
             status=Reservation.Status.CONFIRMED, **kwargs):
        """timezone.now() 기준 상대 시각으로 예약 생성."""
        now = timezone.now()
        defaults = dict(
            space=space or self.space,
            applicant_name="김믿음",
            applicant_phone="01012345678",
            custom_team_name="청년부",
            leader_phone="01098765432",
            headcount=10,
            purpose="정기모임",
            start_datetime=now + datetime.timedelta(minutes=start_min),
            end_datetime=now + datetime.timedelta(minutes=end_min),
            status=status,
        )
        defaults.update(kwargs)
        return Reservation.objects.create(**defaults)

    def _all_reservations(self, response):
        return [r for b in response.data["buildings"] for r in b["reservations"]]

    def test_returns_live_and_upcoming_only(self):
        live     = self._rel(-30, 30)     # 진행 중
        upcoming = self._rel(60, 120)     # 2시간 내 시작
        self._rel(180, 240)               # 윈도우 밖(3시간 뒤) → 제외
        self._rel(-120, -60)              # 지난 예약 → 제외

        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, 200)
        ids = [r["id"] for r in self._all_reservations(response)]
        self.assertCountEqual(ids, [live.id, upcoming.id])

    def test_state_field(self):
        live     = self._rel(-30, 30)
        upcoming = self._rel(60, 120)
        response = self.client.get(self.URL)
        states = {r["id"]: r["state"] for r in self._all_reservations(response)}
        self.assertEqual(states[live.id], "live")
        self.assertEqual(states[upcoming.id], "upcoming")

    def test_excludes_cancelled_rejected_deleted(self):
        self._rel(-30, 30, status=Reservation.Status.CANCELLED)
        self._rel(-30, 30, status=Reservation.Status.REJECTED)
        self._rel(-30, 30, is_deleted=True)
        response = self.client.get(self.URL)
        self.assertEqual(self._all_reservations(response), [])

    def test_groups_by_active_building_only(self):
        gn       = Building.objects.create(name="가나안홀", is_active=True)
        gn_space = Space.objects.create(building=gn, name="에벤에셀홀", floor=-1, is_active=True)
        Building.objects.create(name="비활성동", is_active=False)

        self._rel(-30, 30, space=self.space)   # 본당
        self._rel(60, 120, space=gn_space)     # 가나안홀

        response = self.client.get(self.URL)
        names = [b["name"] for b in response.data["buildings"]]
        self.assertIn("본당", names)
        self.assertIn("가나안홀", names)
        self.assertNotIn("비활성동", names)

    def test_empty_active_building_included_as_empty_list(self):
        # 예약 없는 활성 건물도 탭/빈 상태용으로 빈 배열로 포함
        Building.objects.create(name="무지개홀", is_active=True)
        response = self.client.get(self.URL)
        rainbow = next(b for b in response.data["buildings"] if b["name"] == "무지개홀")
        self.assertEqual(rainbow["reservations"], [])

    def test_window_minutes_param(self):
        far = self._rel(150, 210)   # 150분 뒤 시작
        default_ids = [r["id"] for r in self._all_reservations(self.client.get(self.URL))]
        self.assertNotIn(far.id, default_ids)
        wide_ids = [r["id"] for r in self._all_reservations(self.client.get(self.URL, {"window_minutes": 180}))]
        self.assertIn(far.id, wide_ids)

    def test_includes_now_and_window(self):
        response = self.client.get(self.URL)
        self.assertIn("now", response.data)
        self.assertEqual(response.data["window_minutes"], 120)

    def test_no_auth_required(self):
        self.client.credentials()
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, 200)

    def test_does_not_leak_private_fields(self):
        self._rel(-30, 30)
        response = self.client.get(self.URL)
        all_res = self._all_reservations(response)
        self.assertTrue(all_res)
        sample = all_res[0]
        for leaked in ("applicant_phone", "leader_phone", "admin_note", "headcount"):
            self.assertNotIn(leaked, sample)
        for present in ("applicant_team", "applicant_name", "purpose", "state", "space"):
            self.assertIn(present, sample)
