FROM node:lts

WORKDIR /app

COPY . .

RUN yarn install && yarn build

WORKDIR /app/packages/rest/build

EXPOSE 4002

CMD ["yarn", "start:build"]
