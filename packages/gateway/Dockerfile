FROM node:lts

WORKDIR /app

COPY . .

RUN yarn install && yarn build

WORKDIR /app/packages/gateway/build

EXPOSE 4000

CMD ["yarn", "start:build"]
