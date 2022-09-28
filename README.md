<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

Very early pre-alpha experiment using [Nest](https://github.com/nestjs/nest) to act as a command and control server for reverse-shell instances over websockets. Small mini-experiments exist and notable related suboptimizations exist herein as this repo was not intended for an audience anytime in the near future.

Some conscious anti-patterns exist in the current state for the sole purpose of agility experimenting with different method configurations, as final architectural decisions related to services and their relationships have yet to be finalized (for example, returning null or undefined values instead of throwing an error and handling appropriately where this may be more appropriate.)

The "base" sub-directory still exists largely to satisfy my own desire to see that a free Heroku dyno has awoken when experimenting.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Be gentle 🤣

## Stay in touch

Mark's got my deets.
