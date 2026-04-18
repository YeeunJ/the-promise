from django.db import migrations, models
import django.db.models.deletion


def clear_teams(apps, schema_editor):
    Team = apps.get_model("reservations", "Team")
    Team.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("reservations", "0002_team_reservation_deleted_at_reservation_is_deleted"),
    ]

    operations = [
        # 1. Leader 테이블 생성
        migrations.CreateModel(
            name="Leader",
            fields=[
                ("id",         models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name",       models.CharField(max_length=50)),
                ("phone",      models.CharField(max_length=20)),
                ("is_active",  models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "leaders"},
        ),
        # 2. 기존 Team 데이터 전체 삭제 (새 데이터로 교체)
        migrations.RunPython(clear_teams, migrations.RunPython.noop),
        # 3. leader_phone 제거
        migrations.RemoveField(model_name="team", name="leader_phone"),
        # 4. category 추가
        migrations.AddField(
            model_name="team",
            name="category",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("사역팀",       "사역팀"),
                    ("교회학교",     "교회학교"),
                    ("찬양대",       "찬양대"),
                    ("권사회",       "권사회"),
                    ("안수집사회",   "안수집사회"),
                    ("여전도연합회", "여전도연합회"),
                    ("여전도회",     "여전도회"),
                    ("남선교회",     "남선교회"),
                    ("청년회",       "청년회"),
                    ("교구",         "교구(구역)"),
                ],
                default="사역팀",
            ),
        ),
        # 5. leader FK 추가
        migrations.AddField(
            model_name="team",
            name="leader",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="teams",
                to="reservations.leader",
            ),
        ),
    ]
