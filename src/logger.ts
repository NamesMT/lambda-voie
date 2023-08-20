/* eslint-disable turbo/no-undeclared-env-vars */
import pino from 'pino'
import { pinoLambdaDestination } from 'pino-lambda'

const destination = pinoLambdaDestination()
export const logger = pino(
  {
    level: process.env.isLocal ? 'debug' : 'info',
    base: undefined,
  // redact: {
  //   paths: [],
  //   remove: true,
  // },
  },
  // @ts-expect-error undefined DestinationStream
  process.env.isLocal ? undefined : destination,
)
