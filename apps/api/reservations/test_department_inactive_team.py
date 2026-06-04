"""
DepartmentListView(/api/v1/departments/) 가 비활성(is_active=False) 팀을
nested teams 에서 제외하는지 검증한다.

기존 tests.py 가 구버전 스키마(Leader 등)를 참조해 import 단계에서 깨져 있어,
현재 스키마(Pastor/Department/Team) 기준 독립 테스트로 작성한다.
실행: python manage.py test reservations.test_department_inactive_team
"""
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Department, Pastor, Team


class DepartmentListInactiveTeamTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.pastor = Pastor.objects.create(
            name="이상윤", title="목사", phone="010-0000-0000"
        )
        self.dept = Department.objects.create(
            name="1교구", display_order=1, pastor=self.pastor, is_active=True
        )
        Team.objects.create(
            name="활성팀", department=self.dept, leader_phone="010-0000-0000", is_active=True
        )
        Team.objects.create(
            name="테스트", department=self.dept, leader_phone="010-0000-0000", is_active=False
        )

    def _teams_of(self, data, dept_name):
        dept = next(d for d in data if d["name"] == dept_name)
        return [t["name"] for t in dept["teams"]]

    def test_active_team_included(self):
        response = self.client.get("/api/v1/departments/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("활성팀", self._teams_of(response.data, "1교구"))

    def test_inactive_team_excluded(self):
        response = self.client.get("/api/v1/departments/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("테스트", self._teams_of(response.data, "1교구"))
