.PHONY: bootstrap up down logs migrate clean

bootstrap:
	pnpm install

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec api pnpm migrate

clean:
	docker compose down -v
	docker system prune -f
