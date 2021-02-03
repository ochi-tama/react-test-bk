ARG VARIANT="node-alpine"
# FROM buildpack-deps:${VARIANT}-curl
FROM node:12.20.1-alpine3.12

RUN apk update && apk upgrade && apk add \
    git openjdk11-jre-headless
RUN yarn global add firebase-tools


