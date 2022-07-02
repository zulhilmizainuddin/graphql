# graphql

This monorepo is an example GraphQL project for reference, learning and experimentation.

## Getting Started

Run Docker Compose to start the following services:
- ~~Zookeeper~~
- ~~Kafka~~
- MongoDB
- Redis
- Prometheus (http://localhost:9090)
- Node Exporter
- Grafana (http://localhost:3000)
- Remote GraphQL service (http://localhost:4001/graphql)
- REST service (http://localhost:4002)

```sh
$ docker-compose up
```

~~Add `kafka` to local machine `/etc/hosts`.~~
Add `redis` to local machine `/etc/hosts`.

```
kafka       127.0.0.1
redis       127.0.0.1
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

**Set subscriptions implementation to `graphql-ws` under Apollo Studio connection settings to enable subscriptions.**
