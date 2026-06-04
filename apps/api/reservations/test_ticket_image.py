"""
generate_ticket_image 가 현재 스키마(team FK / custom_team_name)에서
크래시 없이 PNG 를 생성하는지 검증한다.

ticket.py 가 제거된 reservation.applicant_team 을 참조해 티켓 생성 시
AttributeError 가 나던 회귀를 회귀 테스트로 고정한다.
실행: python manage.py test reservations.test_ticket_image
"""
import datetime

from django.test import TestCase
from django.utils import timezone

from .models import Building, Department, Pastor, Reservation, Space, Team
from .ticket import generate_ticket_image


class TicketImageTest(TestCase):
    def setUp(self):
        self.building = Building.objects.create(name="본당", is_active=True)
        self.space = Space.objects.create(
            building=self.building, name="자람뜰홀", floor=1, capacity=50, is_active=True
        )
        self.pastor = Pastor.objects.create(name="이상윤", title="목사", phone="010-0000-0000")
        self.dept = Department.objects.create(name="1교구", display_order=1, pastor=self.pastor)
        self.team = Team.objects.create(
            name="대림1", department=self.dept, leader_phone="010-0000-0000"
        )

    def _make(self, **kwargs):
        defaults = dict(
            space=self.space,
            applicant_name="홍길동",
            applicant_phone="010-1234-5678",
            leader_phone="010-0000-0000",
            headcount=10,
            purpose="정기 모임",
            start_datetime=timezone.make_aware(datetime.datetime(2030, 6, 1, 10, 0)),
            end_datetime=timezone.make_aware(datetime.datetime(2030, 6, 1, 12, 0)),
            status=Reservation.Status.CONFIRMED,
        )
        defaults.update(kwargs)
        return Reservation.objects.create(**defaults)

    def test_ticket_with_team(self):
        reservation = self._make(team=self.team)
        image = generate_ticket_image(reservation)
        self.assertEqual(image.size, (600, 900))

    def test_ticket_with_custom_team_name(self):
        reservation = self._make(team=None, custom_team_name="외부 단체")
        image = generate_ticket_image(reservation)
        self.assertEqual(image.size, (600, 900))
