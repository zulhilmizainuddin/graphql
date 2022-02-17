FROM node:lts-slim

WORKDIR /app

COPY . .

RUN yarn install && yarn build

WORKDIR /app/build

EXPOSE 4000

CMD ["yarn", "start"]
