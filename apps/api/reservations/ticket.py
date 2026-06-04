"""
예약 티켓 이미지 생성 모듈.
Pillow + qrcode 를 사용해 CGV 모바일 티켓 스타일의 PNG를 생성합니다.
"""

import io
import os

import qrcode
from PIL import Image, ImageDraw, ImageFont

# 색상 팔레트
COLOR_BG_HEADER = "#1a1a2e"
COLOR_BG_BODY   = "#16213e"
COLOR_BG_QR     = "#0f3460"
COLOR_TEXT      = "#e0e0e0"
COLOR_ACCENT    = "#e94560"
COLOR_LABEL     = "#a0a0b0"
COLOR_TEARLINE  = "#ffffff"

# 이미지 크기
WIDTH  = 600
HEIGHT = 900

# 폰트 경로 (없으면 기본 폰트로 폴백)
_FONT_DIR  = os.path.join(os.path.dirname(__file__), "static", "fonts")
_FONT_PATH = os.path.join(_FONT_DIR, "NanumGothic.ttf")


def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if os.path.exists(_FONT_PATH):
        return ImageFont.truetype(_FONT_PATH, size)
    return ImageFont.load_default()


def _draw_dotted_line(draw: ImageDraw.ImageDraw, y: int, width: int) -> None:
    """점선 tear line을 그립니다."""
    dot_width  = 8
    gap        = 6
    x = 0
    while x < width:
        draw.rectangle([x, y, x + dot_width, y + 2], fill=COLOR_TEARLINE)
        x += dot_width + gap


def _make_qr_image(data: str, box_size: int = 6) -> Image.Image:
    qr = qrcode.QRCode(box_size=box_size, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    return qr.make_image(fill_color=COLOR_BG_HEADER, back_color=COLOR_BG_QR).convert("RGBA")


def generate_ticket_image(reservation) -> Image.Image:
    """
    Reservation 인스턴스를 받아 PNG Image 객체를 반환합니다.

    QR코드 인코딩 값: 예약 ID (str)
    TODO: 추후 예약 상세 페이지 URL로 변경 예정
    """
    img  = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG_HEADER)
    draw = ImageDraw.Draw(img)

    font_title  = _load_font(28)
    font_space  = _load_font(36)
    font_label  = _load_font(18)
    font_value  = _load_font(20)
    font_small  = _load_font(16)

    # ── 헤더 ──────────────────────────────────────────────
    header_h = 80
    draw.rectangle([0, 0, WIDTH, header_h], fill=COLOR_BG_HEADER)
    draw.text((WIDTH // 2, 24), "THE PROMISE", font=font_title, fill=COLOR_ACCENT, anchor="mt")

    # ── 공간 이름 (타이틀) ────────────────────────────────
    space_section_h = 120
    draw.rectangle([0, header_h, WIDTH, header_h + space_section_h], fill=COLOR_BG_BODY)
    space_name = reservation.space.name
    draw.text((WIDTH // 2, header_h + 30), space_name, font=font_space, fill=COLOR_TEXT, anchor="mt")

    # ── 정보 영역 ─────────────────────────────────────────
    body_top = header_h + space_section_h
    tearline_y = 680
    draw.rectangle([0, body_top, WIDTH, tearline_y], fill=COLOR_BG_BODY)

    status_display = {
        "pending":   "대기 중",
        "confirmed": "승인됨",
        "rejected":  "거절됨",
        "cancelled": "취소됨",
    }.get(reservation.status, reservation.status)

    start_str = reservation.start_datetime.strftime("%Y-%m-%d %H:%M")
    end_str   = reservation.end_datetime.strftime("%Y-%m-%d %H:%M")
    updated_str = reservation.updated_at.strftime("%Y-%m-%d")

    rows = [
        ("신청자",      reservation.applicant_name),
        ("연락처",      reservation.applicant_phone),
        ("팀",          reservation.team.name if reservation.team else reservation.custom_team_name),
        ("리더 연락처", reservation.leader_phone),
        ("목적",        reservation.purpose),
        ("시작",        start_str),
        ("종료",        end_str),
        ("상태",        status_display),
        ("확인일자",    updated_str),
    ]

    label_x = 48
    value_x = 200
    row_h   = 44
    y       = body_top + 24

    for label, value in rows:
        draw.text((label_x, y), label, font=font_label, fill=COLOR_LABEL)
        text_color = COLOR_ACCENT if label == "상태" else COLOR_TEXT
        draw.text((value_x, y), str(value), font=font_value, fill=text_color)
        y += row_h

    # ── Tear line ──────────────────────────────────────────
    _draw_dotted_line(draw, tearline_y, WIDTH)

    # ── QR 영역 ───────────────────────────────────────────
    draw.rectangle([0, tearline_y + 3, WIDTH, HEIGHT], fill=COLOR_BG_QR)

    # TODO: 추후 예약 상세 페이지 URL로 변경 예정 (현재는 예약 ID만 인코딩)
    qr_img = _make_qr_image(str(reservation.id))
    qr_size = 160
    qr_img  = qr_img.resize((qr_size, qr_size))
    qr_x    = (WIDTH - qr_size) // 2
    qr_y    = tearline_y + 20
    img.paste(qr_img, (qr_x, qr_y))

    id_text = f"예약번호  #{reservation.id}"
    draw.text((WIDTH // 2, qr_y + qr_size + 16), id_text, font=font_small, fill=COLOR_LABEL, anchor="mt")

    return img
