import { isDevelopment } from 'std-env'
import { pino } from 'pino'
import { lambdaRequestTracker, pinoLambdaDestination } from 'pino-lambda'

const destination = pinoLambdaDestination()
export const logger = pino(
  {
    level: isDevelopment ? 'debug' : 'info',
    base: undefined,
  // redact: {
  //   paths: [],
  //   remove: true,
  // },
  },
  // @ts-expect-error undefined DestinationStream
  isDevelopment ? undefined : destination,
)
export const withRequest = lambdaRequestTracker()
