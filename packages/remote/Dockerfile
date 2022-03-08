FROM node:lts

WORKDIR /app

COPY . .

RUN yarn install && yarn build

WORKDIR /app/packages/remote/build

EXPOSE 4001

CMD ["yarn", "start:build"]
