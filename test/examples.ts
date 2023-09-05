import { Buffer } from 'node:buffer'
import type { ALBEvent, APIGatewayProxyEvent, CloudFrontRequestEvent } from 'aws-lambda'

export const ApiGatewayExample: APIGatewayProxyEvent = {
  body: 'eyJ0ZXN0IjoiYm9keSJ9',
  resource: '/{proxy+}',
  path: '/v1/tiles/aerial/EPSG:3857/6/3/41.json',
  httpMethod: 'GET',
  isBase64Encoded: true,
  queryStringParameters: {
    foo: 'bar',
  },
  multiValueQueryStringParameters: {
    foo: ['bar'],
  },
  pathParameters: {
    proxy: '/path/to/resource',
  },
  stageVariables: {
    baz: 'qux',
  },
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'Cache-Control': 'max-age=0',
    'CloudFront-Forwarded-Proto': 'https',
    'CloudFront-Is-Desktop-Viewer': 'true',
    'CloudFront-Is-Mobile-Viewer': 'false',
    'CloudFront-Is-SmartTV-Viewer': 'false',
    'CloudFront-Is-Tablet-Viewer': 'false',
    'CloudFront-Viewer-Country': 'US',
    'Host': '1234567890.execute-api.ap-southeast-2.amazonaws.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Custom User Agent String',
    'Via': '1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)',
    'X-Amz-Cf-Id': 'cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==',
    'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https',
  },
  multiValueHeaders: {
    'Accept': ['text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'],
    'Accept-Encoding': ['gzip, deflate, sdch'],
    'Accept-Language': ['en-US,en;q=0.8'],
    'Cache-Control': ['max-age=0'],
    'CloudFront-Forwarded-Proto': ['https'],
    'CloudFront-Is-Desktop-Viewer': ['true'],
    'CloudFront-Is-Mobile-Viewer': ['false'],
    'CloudFront-Is-SmartTV-Viewer': ['false'],
    'CloudFront-Is-Tablet-Viewer': ['false'],
    'CloudFront-Viewer-Country': ['US'],
    'Host': ['0123456789.execute-api.ap-southeast-2.amazonaws.com'],
    'Upgrade-Insecure-Requests': ['1'],
    'User-Agent': ['Custom User Agent String'],
    'Via': ['1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)'],
    'X-Amz-Cf-Id': ['cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA=='],
    'X-Forwarded-For': ['127.0.0.1, 127.0.0.2'],
    'X-Forwarded-Port': ['443'],
    'X-Forwarded-Proto': ['https'],
  },
  requestContext: {
    authorizer: undefined,
    accountId: '123456789012',
    resourceId: '123456',
    stage: 'prod',
    requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
    requestTime: '09/Apr/2015:12:34:56 +0000',
    requestTimeEpoch: 1428582896000,
    identity: {
      apiKey: 'null',
      apiKeyId: 'null',
      clientCert: null,
      principalOrgId: 'null',
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      accessKey: null,
      sourceIp: '127.0.0.1',
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: 'Custom User Agent String',
      user: null,
    },
    path: '/prod/path/to/resource',
    resourcePath: '/{proxy+}',
    httpMethod: 'POST',
    apiId: '1234567890',
    protocol: 'HTTP/1.1',
  },
}

export const CloudfrontExample: CloudFrontRequestEvent = {
  Records: [
    {
      cf: {
        config: {
          distributionDomainName: 'example',
          distributionId: 'EXAMPLE',
          eventType: 'viewer-request',
          requestId: 'abc-123',
        },
        request: {
          body: undefined,
          uri: '/v1/tiles/aerial/EPSG:3857/6/3/41.json',
          method: 'GET',
          clientIp: '2001:cdba::3257:9652',
          querystring: '?foo=bar',
          headers: {
            host: [
              {
                key: 'Host',
                value: 'd123.cf.net',
              },
            ],
          },
        },
      },
    },
  ],
}

export const S3: S3TriggerEvent = {
  Records: [
    {
      eventVersion: '2.0',
      eventSource: 'aws:s3',
      awsRegion: 'us-east-1',
      eventTime: '1970-01-01T00:00:00.000Z',
      eventName: 'ObjectCreated:Put',
      userIdentity: {
        principalId: 'EXAMPLE',
      },
      requestParameters: {
        sourceIPAddress: '127.0.0.1',
      },
      responseElements: {
        'x-amz-request-id': 'EXAMPLE123456789',
        'x-amz-id-2': 'EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH',
      },
      s3: {
        s3SchemaVersion: '1.0',
        configurationId: 'testConfigRule',
        bucket: {
          name: 'example-bucket',
          ownerIdentity: {
            principalId: 'EXAMPLE',
          },
          arn: 'arn:aws:s3:::example-bucket',
        },
        object: {
          key: 'test%2Fkey',
          size: 1024,
          eTag: '0123456789abcdef0123456789abcdef',
          sequencer: '0A1B2C3D4E5F678901',
        },
      },
    },
  ],
}

export const AlbExample: ALBEvent = {
  requestContext: {
    elb: {
      targetGroupArn:
        'arn:aws:elasticloadbalancing:ap-southeast-2:000000000:targetgroup/Serve-LBHtt-1OHAJAJC2EOCV/c7cdb5edeadbeefa9',
    },
  },
  httpMethod: 'GET',
  path: '/v1/tiles/aerial/EPSG:3857/6/3/41.json',
  queryStringParameters: {
    api: 'abc123',
  },
  headers: {
    'accept-encoding': 'gzip',
    'dnt': '1',
    'host': 'tiles.basemaps.linz.govt.nz',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Amazon CloudFront',
    'content-type': 'application/json',
    'via': '2.0 ba7353b1182f8842b4cc2c50f1a0b483.cloudfront.net (CloudFront)',
    'x-amz-cf-id': '2KH_vk3iG4JdLC6IYdoby0jDrPePElLNSGGLERDsgHU2ir_W_c0PeQ==',
    'x-amzn-trace-id': 'Self=1-61106e71-29b2fd296a0a4ad55a408771;Root=1-61106e71-20944ade017732db548d71b2',
    'x-forwarded-for': '64.252.109.197, 10.160.1.20',
    'x-forwarded-port': '443',
    'x-forwarded-proto': 'https',
  },
  body: Buffer.from(JSON.stringify({ status: 'ok' })).toString('base64'),
  isBase64Encoded: true,
}

export const UrlExample: UrlEvent = {
  version: '2.0',
  routeKey: '$default',
  rawPath: '/v1/%F0%9F%A6%84/%F0%9F%8C%88/%F0%9F%A6%84.json',
  rawQueryString: '%F0%9F%A6%84=abc123',
  headers: {
    'x-amzn-trace-id': 'Root=1-624e71a0-114297900a437c050c74f1fe',
    'x-forwarded-proto': 'https',
    'host': 'fakeId.lambda-url.ap-southeast-2.on.aws',
    'x-forwarded-port': '443',
    'x-forwarded-for': '10.88.254.254',
    'accept-encoding': 'br,gzip',
    'x-amz-cf-id': '5jJe5RyAHtE6OmIFkedddTRlFpvHYZvGIwoWNEm9YJ0OUHOFVET_Pw==',
    'user-agent': 'Amazon CloudFront',
    'via': '2.0 db2406d2a95ec212c318a2e2518f9244.cloudfront.net (CloudFront)',
  },
  requestContext: {
    accountId: 'anonymous',
    apiId: 'fakeId',
    domainName: 'fakeId.lambda-url.ap-southeast-2.on.aws',
    domainPrefix: 'fakeId',
    http: {
      method: 'GET',
      path: '/v1/🦄/🌈/🦄.json',
      protocol: 'HTTP/1.1',
      sourceIp: '64.252.109.40',
      userAgent: 'Amazon CloudFront',
    },
    requestId: '6ffbc360-d84e-463c-a112-dcc6279cb4bb',
    routeKey: '$default',
    stage: '$default',
    time: '07/Apr/2022:05:07:44 +0000',
    timeEpoch: 1649308064171,
  },
  isBase64Encoded: false,
}
