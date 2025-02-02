# Click-ly

A RESTful API that provides info about users' clicks and their's points

## How to launch the project

### Prerequisites

You need to have installed

- [Bun](https://bun.sh) for launch the app
- [Docker](https://www.docker.com) for launch infrastructure components
- *Optional* [DBeaver](https://dbeaver.io) for convenient interaction with databases (the project uses ClickHouse and CouchDB)

### Launch instruction

1. Clone this repo

```shell
git clone https://github.com/Pro100CaHya/clicks-ly.git
```

2. Install the dependencies

```shell
bun install
```

3. Run docker-compose file

```
docker compose up -d
```

4. Run the project

```shell
bun run dev
```

When you'll see comment **🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}**, you can use REST API

You can also see Swagger on link: http://localhost:3000/swagger

Clickhouse client (Tabix): http://localhost:8080