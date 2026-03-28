.PHONY: dev stop logs migrate seed shell-api shell-worker

dev:
	docker compose -f infra/docker-compose.yml up

stop:
	docker compose -f infra/docker-compose.yml down

logs:
	docker compose -f infra/docker-compose.yml logs -f

migrate:
	docker compose -f infra/docker-compose.yml exec api python manage.py migrate

seed:
	docker compose -f infra/docker-compose.yml exec api python manage.py loaddata rooms.json

shell-api:
	docker compose -f infra/docker-compose.yml exec api python manage.py shell

shell-worker:
	docker compose -f infra/docker-compose.yml exec worker bash
