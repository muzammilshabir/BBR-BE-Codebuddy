# Node v20 LTS
FROM node:iron

RUN apt update
RUN apt-get install -y bash curl && curl -1sLf \
'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash \
&& apt-get update && apt-get install -y infisical

WORKDIR /app

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY .npmrc ./
COPY turbo.json ./
COPY ./apps/api/package.json ./apps/api/package.json
COPY ./packages/prettier/package.json ./packages/prettier/package.json
COPY ./packages/api-core/package.json ./packages/api-core/package.json

RUN pnpm fetch

COPY ./apps ./apps
COPY ./packages ./packages

RUN pnpm install

RUN pnpm build


EXPOSE 5000

ARG INFISICAL_TOKEN
ENV INFISICAL_TOKEN=$INFISICAL_TOKEN
ARG INFISICAL_API_URL
ENV INFISICAL_API_URL=$INFISICAL_API_URL
ARG INFISICAL_ENV
ENV INFISICAL_ENV=$INFISICAL_ENV
ARG INFISICAL_PROJECT_ID
ENV INFISICAL_PROJECT_ID=$INFISICAL_PROJECT_ID

CMD infisical run --projectId=$INFISICAL_PROJECT_ID --env $INFISICAL_ENV --token $INFISICAL_TOKEN --domain $INFISICAL_API_URL --command "pnpm start:prod"