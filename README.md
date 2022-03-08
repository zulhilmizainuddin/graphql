# graphql

This monorepo is an example GraphQL project for reference, learning and experimentation.

## Getting Started

Start Zookeeper, Kafka, MongoDB, Redis, Remote GraphQL service and REST service.

```sh
$ docker-compose up
```

Install packages.

```sh
$ yarn install
```

Start main gateway GraphQL service.

```sh
$ cd packages/server
$ yarn start
```

Load Apollo Studio in browser at http://localhost:4000/graphql.
