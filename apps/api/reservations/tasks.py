from celery import shared_task


# Phase 2에서 구현 예정
@shared_task
def send_reservation_notification(reservation_id: int):
    """예약 확인 알림 발송 (Phase 2)"""
    pass
