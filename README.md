# graphql

This monorepo is an example GraphQL project for reference, learning and experimentation.

## Getting Started

Start Zookeeper, Kafka, MongoDB and Redis.

```sh
$ docker-compose up
```

Install packages.

```sh
$ yarn install
```

Start remote GraphQL service and REST service.

```sh
$ yarn start:subgraph
```

Start main gateway GraphQL service.

```sh
$ yarn start:graph
```

Load Apollo Studio in browser at http://localhost:4000/graphql.
