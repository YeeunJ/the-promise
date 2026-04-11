import datetime

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import Building, Reservation, Space, Team


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

        self.admin = User.objects.create_superuser(username="admin", password="admin1234")
        self.token = Token.objects.create(user=self.admin)

    def _make_dt(self, hour, minute=0, day=1):
        return timezone.make_aware(datetime.datetime(2030, 6, day, hour, minute))

    def _make_reservation(
        self,
        start_hour=10,
        end_hour=12,
        status=Reservation.Status.CONFIRMED,
        day=1,
        space=None,
        **kwargs,
    ):
        defaults = dict(
            space=space or self.space,
            applicant_name="홍길동",
            applicant_phone="01012345678",
            applicant_team="청년부",
            leader_phone="01098765432",
            headcount=10,
            purpose="팀 모임",
            start_datetime=self._make_dt(start_hour, day=day),
            end_datetime=self._make_dt(end_hour, day=day),
            status=status,
        )
        defaults.update(kwargs)
        return Reservation.objects.create(**defaults)


# ─── 기존 테스트 ──────────────────────────────────────────────────────────────

class HasConflictTest(BaseTestCase):
    """Reservation.has_conflict() 모델 메서드"""

    def test_no_conflict_when_no_reservations(self):
        r = Reservation(
            space=self.space,
            start_datetime=self._make_dt(10),
            end_datetime=self._make_dt(12),
        )
        self.assertFalse(r.has_conflict())

    def test_conflict_when_time_overlaps(self):
        self._make_reservation(10, 12)
        r = Reservation(
            space=self.space,
            start_datetime=self._make_dt(11),
            end_datetime=self._make_dt(13),
        )
        self.assertTrue(r.has_conflict())

    def test_no_conflict_adjacent_time(self):
        # 기존 예약이 10~12시면 12시 시작은 충돌 아님
        self._make_reservation(10, 12)
        r = Reservation(
            space=self.space,
            start_datetime=self._make_dt(12),
            end_datetime=self._make_dt(14),
        )
        self.assertFalse(r.has_conflict())

    def test_no_conflict_with_rejected_reservation(self):
        # 거절된 예약은 충돌 대상이 아님
        self._make_reservation(10, 12, status=Reservation.Status.REJECTED)
        r = Reservation(
            space=self.space,
            start_datetime=self._make_dt(10),
            end_datetime=self._make_dt(12),
        )
        self.assertFalse(r.has_conflict())

    def test_no_conflict_with_self(self):
        # 저장된 예약이 자기 자신과 충돌하지 않아야 함 (수정 시나리오)
        existing = self._make_reservation(10, 12)
        self.assertFalse(existing.has_conflict())

    def test_no_conflict_different_space(self):
        other_space = Space.objects.create(building=self.building, name="다른공간", is_active=True)
        self._make_reservation(10, 12)
        r = Reservation(
            space=other_space,
            start_datetime=self._make_dt(10),
            end_datetime=self._make_dt(12),
        )
        self.assertFalse(r.has_conflict())

    def test_no_conflict_with_deleted_reservation(self):
        # 소프트 삭제된 예약은 충돌 대상이 아님
        existing = self._make_reservation(10, 12)
        existing.is_deleted = True
        existing.save()
        r = Reservation(
            space=self.space,
            start_datetime=self._make_dt(10),
            end_datetime=self._make_dt(12),
        )
        self.assertFalse(r.has_conflict())


class SpaceListViewTest(BaseTestCase):
    """GET /api/v1/spaces/"""

    def test_returns_active_buildings_and_spaces(self):
        response = self.client.get("/api/v1/spaces/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "본당")
        space_names = [s["name"] for s in response.data[0]["spaces"]]
        self.assertIn("자람뜰홀", space_names)

    def test_inactive_space_excluded(self):
        response = self.client.get("/api/v1/spaces/")
        space_names = [s["name"] for s in response.data[0]["spaces"]]
        self.assertNotIn("비활성공간", space_names)

    def test_inactive_building_excluded(self):
        Building.objects.create(name="비활성건물", is_active=False)
        response = self.client.get("/api/v1/spaces/")
        building_names = [b["name"] for b in response.data]
        self.assertNotIn("비활성건물", building_names)


class ReservationCreateTest(BaseTestCase):
    """POST /api/v1/reservations/"""

    def _payload(self, start_hour=10, end_hour=12, start_minute=0, end_minute=0):
        return {
            "space": self.space.pk,
            "applicant_name": "홍길동",
            "applicant_phone": "01012345678",
            "applicant_team": "청년부",
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

    def test_record_saved_even_when_rejected(self):
        # 거절돼도 이력 보존을 위해 레코드는 저장됨
        self._make_reservation(10, 12)
        self.client.post("/api/v1/reservations/", self._payload(11, 13), format="json")
        self.assertEqual(Reservation.objects.filter(status="rejected").count(), 1)

    def test_validation_error_end_before_start(self):
        payload = self._payload()
        payload["end_datetime"] = self._make_dt(9).isoformat()
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("validation_error", response.data["error"])

    def test_validation_error_not_30min_interval(self):
        payload = self._payload()
        payload["end_datetime"] = self._make_dt(10, 45).isoformat()
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("validation_error", response.data["error"])

    def test_validation_error_inactive_space(self):
        payload = self._payload()
        payload["space"] = self.inactive_space.pk
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("validation_error", response.data["error"])

    def test_validation_error_past_datetime(self):
        payload = self._payload()
        payload["start_datetime"] = "2020-01-01T10:00:00+09:00"
        payload["end_datetime"] = "2020-01-01T12:00:00+09:00"
        response = self.client.post("/api/v1/reservations/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("validation_error", response.data["error"])

    def test_confirmed_even_if_deleted_reservation_exists(self):
        # 소프트 삭제된 예약과 시간이 겹쳐도 confirmed
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
        response = self.client.get(
            "/api/v1/reservations/", {"name": "홍길동", "phone": "01012345678"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_no_results_for_wrong_phone(self):
        self._make_reservation()
        response = self.client.get(
            "/api/v1/reservations/", {"name": "홍길동", "phone": "01099999999"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_400_when_params_missing(self):
        response = self.client.get("/api/v1/reservations/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_deleted_reservation_not_returned(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get(
            "/api/v1/reservations/", {"name": "홍길동", "phone": "01012345678"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class SpaceReservationListViewTest(BaseTestCase):
    """GET /api/v1/spaces/<id>/reservations/?date="""

    def test_returns_confirmed_reservations_for_date(self):
        self._make_reservation(start_hour=10, end_hour=12)
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "2030-06-01"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertIn("start_datetime", response.data[0])
        self.assertIn("end_datetime", response.data[0])

    def test_excludes_rejected_reservations(self):
        self._make_reservation(status=Reservation.Status.REJECTED)
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "2030-06-01"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_excludes_other_dates(self):
        self._make_reservation(day=1)
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "2030-06-02"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_400_when_date_missing(self):
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_404_when_space_not_found(self):
        response = self.client.get("/api/v1/spaces/9999/reservations/", {"date": "2030-06-01"})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "not_found")

    def test_400_when_date_format_invalid(self):
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "abc"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_excludes_deleted_reservations(self):
        r = self._make_reservation(start_hour=10, end_hour=12)
        r.is_deleted = True
        r.save()
        response = self.client.get(f"/api/v1/spaces/{self.space.pk}/reservations/", {"date": "2030-06-01"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class AdminLoginViewTest(BaseTestCase):
    """POST /api/v1/admin/login/"""

    def test_login_success_returns_token(self):
        response = self.client.post(
            "/api/v1/admin/login/",
            {"username": "admin", "password": "admin1234"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)

    def test_login_fail_wrong_password(self):
        response = self.client.post(
            "/api/v1/admin/login/",
            {"username": "admin", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "unauthorized")


class AdminReservationListViewTest(BaseTestCase):
    """GET /api/v1/admin/reservations/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_returns_all_reservations_with_token(self):
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
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_400_when_date_format_invalid(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.get("/api/v1/admin/reservations/", {"date": "abc"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_filter_by_status(self):
        self._make_reservation(status=Reservation.Status.CONFIRMED)
        self._make_reservation(start_hour=14, end_hour=16, status=Reservation.Status.CANCELLED)
        response = self.client.get("/api/v1/admin/reservations/", {"status": "confirmed"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["status"], "confirmed")

    def test_deleted_reservation_not_returned(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class AdminReservationCancelViewTest(BaseTestCase):
    """POST /api/v1/admin/reservations/<id>/cancel/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_cancel_success(self):
        r = self._make_reservation()
        response = self.client.post(
            f"/api/v1/admin/reservations/{r.pk}/cancel/",
            {"admin_note": "테스트 취소"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "cancelled")
        self.assertEqual(response.data["admin_note"], "테스트 취소")

    def test_cancel_without_admin_note(self):
        r = self._make_reservation()
        response = self.client.post(
            f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "cancelled")

    def test_already_cancelled_returns_400(self):
        r = self._make_reservation(status=Reservation.Status.CANCELLED)
        response = self.client.post(
            f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "already_cancelled")

    def test_rejected_reservation_cannot_be_cancelled(self):
        r = self._make_reservation(status=Reservation.Status.REJECTED)
        response = self.client.post(
            f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "cannot_cancel_rejected")

    def test_not_found_returns_404(self):
        response = self.client.post(
            "/api/v1/admin/reservations/9999/cancel/", {}, format="json"
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "not_found")

    def test_401_without_token(self):
        self.client.credentials()
        r = self._make_reservation()
        response = self.client.post(
            f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json"
        )
        self.assertEqual(response.status_code, 401)

    def test_deleted_reservation_cancel_returns_404(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.post(
            f"/api/v1/admin/reservations/{r.pk}/cancel/", {}, format="json"
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "not_found")


# ─── 신규 테스트 ──────────────────────────────────────────────────────────────

class TeamListViewTest(BaseTestCase):
    """GET /api/v1/teams/"""

    def test_returns_active_teams(self):
        Team.objects.create(name="청년부", leader_phone="01012345678", is_active=True)
        Team.objects.create(name="찬양팀", leader_phone="01098765432", is_active=True)
        response = self.client.get("/api/v1/teams/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_inactive_team_excluded(self):
        Team.objects.create(name="청년부", leader_phone="01012345678", is_active=True)
        Team.objects.create(name="비활성팀", leader_phone="01099999999", is_active=False)
        response = self.client.get("/api/v1/teams/")
        names = [t["name"] for t in response.data]
        self.assertNotIn("비활성팀", names)

    def test_returns_empty_when_no_teams(self):
        response = self.client.get("/api/v1/teams/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_response_includes_leader_phone(self):
        Team.objects.create(name="청년부", leader_phone="01012345678", is_active=True)
        response = self.client.get("/api/v1/teams/")
        self.assertIn("leader_phone", response.data[0])
        self.assertEqual(response.data[0]["leader_phone"], "01012345678")


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
        self.assertEqual(response.status_code, 200)
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "full")
        self.assertEqual(result["overlapping_reservations"], [])

    def test_partial_when_partially_overlapping(self):
        # 기존 예약 09:00~11:00 → 요청 10:00~12:00과 부분 겹침
        self._make_reservation(start_hour=9, end_hour=11)
        response = self.client.get(self.BASE_URL, self._params())
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "partial")
        self.assertEqual(len(result["overlapping_reservations"]), 1)

    def test_none_when_fully_blocked(self):
        # 기존 예약 08:00~14:00 → 요청 10:00~12:00 전체 차단
        self._make_reservation(start_hour=8, end_hour=14)
        response = self.client.get(self.BASE_URL, self._params(show_unavailable="Y"))
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "none")

    def test_none_excluded_when_show_unavailable_N(self):
        self._make_reservation(start_hour=8, end_hour=14)
        response = self.client.get(self.BASE_URL, self._params(show_unavailable="N"))
        ids = [r["id"] for r in response.data]
        self.assertNotIn(self.space.pk, ids)

    def test_partial_included_when_show_unavailable_N(self):
        # show_unavailable=N이어도 partial은 포함됨
        self._make_reservation(start_hour=9, end_hour=11)
        response = self.client.get(self.BASE_URL, self._params(show_unavailable="N"))
        ids = [r["id"] for r in response.data]
        self.assertIn(self.space.pk, ids)

    def test_sorted_full_before_partial_before_none(self):
        space_partial = Space.objects.create(building=self.building, name="부분공간", floor=2, is_active=True)
        space_none    = Space.objects.create(building=self.building, name="차단공간", floor=3, is_active=True)

        # space_partial: 부분 겹침 (09:00~11:00)
        self._make_reservation(start_hour=9, end_hour=11, space=space_partial)
        # space_none: 전체 차단 (08:00~14:00)
        self._make_reservation(start_hour=8, end_hour=14, space=space_none)

        response = self.client.get(self.BASE_URL, self._params(show_unavailable="Y"))
        self.assertEqual(response.status_code, 200)
        availabilities = [r["availability"] for r in response.data]
        full_idx    = availabilities.index("full")
        partial_idx = availabilities.index("partial")
        none_idx    = availabilities.index("none")
        self.assertLess(full_idx, partial_idx)
        self.assertLess(partial_idx, none_idx)

    def test_filter_by_building_id(self):
        other_building = Building.objects.create(name="다른건물", is_active=True)
        Space.objects.create(building=other_building, name="다른공간", is_active=True)
        response = self.client.get(self.BASE_URL, self._params(building_id=self.building.pk))
        building_ids = {r["building"]["id"] for r in response.data}
        self.assertEqual(building_ids, {self.building.pk})

    def test_filter_by_floor(self):
        Space.objects.create(building=self.building, name="2층공간", floor=2, is_active=True)
        response = self.client.get(self.BASE_URL, self._params(floor=1))
        floors = {r["floor"] for r in response.data}
        self.assertNotIn(2, floors)

    def test_filter_by_keyword(self):
        response = self.client.get(self.BASE_URL, self._params(keyword="자람"))
        names = [r["name"] for r in response.data]
        self.assertIn("자람뜰홀", names)
        self.assertEqual(len(response.data), 1)

    def test_400_when_end_before_start(self):
        response = self.client.get(self.BASE_URL, self._params(
            start_datetime="2030-06-01T12:00:00+09:00",
            end_datetime="2030-06-01T10:00:00+09:00",
        ))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_400_when_required_params_missing(self):
        response = self.client.get(self.BASE_URL, {"show_unavailable": "Y"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "validation_error")

    def test_inactive_space_excluded(self):
        response = self.client.get(self.BASE_URL, self._params())
        ids = [r["id"] for r in response.data]
        self.assertNotIn(self.inactive_space.pk, ids)

    def test_soft_deleted_reservation_treated_as_no_reservation(self):
        # 소프트 삭제된 예약은 가용성 계산에서 제외 → full
        r = self._make_reservation(start_hour=8, end_hour=14)
        r.is_deleted = True
        r.save()
        response = self.client.get(self.BASE_URL, self._params(show_unavailable="Y"))
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "full")

    def test_cancelled_reservation_not_counted(self):
        # cancelled 예약은 충돌 대상 아님 → full
        self._make_reservation(start_hour=8, end_hour=14, status=Reservation.Status.CANCELLED)
        response = self.client.get(self.BASE_URL, self._params(show_unavailable="Y"))
        result = self._result_for(response, self.space.pk)
        self.assertEqual(result["availability"], "full")

    def test_partial_returns_overlapping_slots(self):
        self._make_reservation(start_hour=9, end_hour=11)
        response = self.client.get(self.BASE_URL, self._params())
        result = self._result_for(response, self.space.pk)
        slot = result["overlapping_reservations"][0]
        self.assertIn("start_datetime", slot)
        self.assertIn("end_datetime", slot)


class AdminReservationDeleteViewTest(BaseTestCase):
    """DELETE /api/v1/admin/reservations/<id>/"""

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_soft_delete_success(self):
        r = self._make_reservation()
        response = self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 204)
        r.refresh_from_db()
        self.assertTrue(r.is_deleted)
        self.assertIsNotNone(r.deleted_at)

    def test_row_still_exists_in_db_after_delete(self):
        r = self._make_reservation()
        self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertTrue(Reservation.objects.filter(pk=r.pk).exists())

    def test_deleted_not_in_general_list(self):
        r = self._make_reservation()
        self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        response = self.client.get("/api/v1/reservations/", {"name": "홍길동", "phone": "01012345678"})
        self.assertEqual(len(response.data), 0)

    def test_deleted_not_in_admin_list(self):
        r = self._make_reservation()
        self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        response = self.client.get("/api/v1/admin/reservations/")
        self.assertEqual(len(response.data), 0)

    def test_already_deleted_returns_404(self):
        r = self._make_reservation()
        self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        response = self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "not_found")

    def test_not_found_returns_404(self):
        response = self.client.delete("/api/v1/admin/reservations/9999/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "not_found")

    def test_401_without_token(self):
        self.client.credentials()
        r = self._make_reservation()
        response = self.client.delete(f"/api/v1/admin/reservations/{r.pk}/")
        self.assertEqual(response.status_code, 401)


class ReservationTicketViewTest(BaseTestCase):
    """GET /api/v1/reservations/<id>/ticket/"""

    def test_returns_png_image(self):
        r = self._make_reservation()
        response = self.client.get(
            f"/api/v1/reservations/{r.pk}/ticket/",
            {"name": "홍길동", "phone": "01012345678"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/png")
        # PNG magic bytes
        self.assertTrue(response.content.startswith(b"\x89PNG"))

    def test_403_when_name_mismatch(self):
        r = self._make_reservation()
        response = self.client.get(
            f"/api/v1/reservations/{r.pk}/ticket/",
            {"name": "김철수", "phone": "01012345678"},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"], "forbidden")

    def test_403_when_phone_mismatch(self):
        r = self._make_reservation()
        response = self.client.get(
            f"/api/v1/reservations/{r.pk}/ticket/",
            {"name": "홍길동", "phone": "01099999999"},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"], "forbidden")

    def test_400_when_name_missing(self):
        r = self._make_reservation()
        response = self.client.get(
            f"/api/v1/reservations/{r.pk}/ticket/",
            {"phone": "01012345678"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "validation_error")

    def test_400_when_phone_missing(self):
        r = self._make_reservation()
        response = self.client.get(
            f"/api/v1/reservations/{r.pk}/ticket/",
            {"name": "홍길동"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "validation_error")

    def test_404_when_reservation_not_found(self):
        response = self.client.get(
            "/api/v1/reservations/9999/ticket/",
            {"name": "홍길동", "phone": "01012345678"},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["error"], "not_found")

    def test_404_when_reservation_is_deleted(self):
        r = self._make_reservation()
        r.is_deleted = True
        r.save()
        response = self.client.get(
            f"/api/v1/reservations/{r.pk}/ticket/",
            {"name": "홍길동", "phone": "01012345678"},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["error"], "not_found")
