# graphql

This monorepo is an example GraphQL project for reference, learning and experimentation.

## Getting Started

Run Docker Compose to start the following services:
- Zookeeper
- Kafka
- MongoDB
- Redis
- Prometheus (http://localhost:9090)
- Node Exporter
- Grafana (http://localhost:3000)
- Remote GraphQL service (http://localhost:4001)
- REST service (http://localhost:4002)

```sh
$ docker-compose up
```

Install packages.

```sh
$ yarn install
```

Start main gateway GraphQL service.

```sh
$ cd packages/gateway
$ yarn start
```

Load Apollo Studio in browser at http://localhost:4000/graphql.
