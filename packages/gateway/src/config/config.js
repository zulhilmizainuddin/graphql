import { cleanEnv, num, str } from 'envalid';

export const config = cleanEnv(process.env, {
  PORT: num({ default: 4000 }),
  GRAPHQL_PATH: str({ default: '/graphql' }),
  MONGO_URL: str({ default: 'mongodb://gateway:password@localhost:27017/graphql' }),
  REDIS_HOST: str({ default: '127.0.0.1' }),
  REDIS_PORT: num({ default: 6379 }),
  REMOTE_SCHEMA_HTTP_ENDPOINT: str({ default: 'http://localhost:4001/graphql' }),
  REMOTE_SCHEMA_WS_ENDPOINT: str({ default: 'ws://localhost:4001/graphql' }),
  REST_ENDPOINT: str({ default: 'http://localhost:4002/' }),
});
