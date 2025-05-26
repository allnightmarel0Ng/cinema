.PHONY: all build up down logs exec ps

PREFIX = docker compose --env-file .env \
		-f monitorings.docker-compose.yml \
		-f db.docker-compose.yml

all: build up

build:
	${PREFIX} build

up:
	${PREFIX} up -d

down:
	${PREFIX} down

logs:
	${PREFIX} logs ${AT}

exec:
	${PREFIX} exec ${AT} ${CMD}

ps:
	${PREFIX} ps -a