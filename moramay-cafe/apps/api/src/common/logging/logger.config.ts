import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';

/**
 * Structured JSON logging configuration (Article VI: Observability).
 * Attaches a request-id to every log line for request correlation.
 */
export const loggerConfig: Params = {
  pinoHttp: {
    genReqId: (req, res) => {
      const existing = req.headers['x-request-id'];
      const requestId = Array.isArray(existing) ? existing[0] : (existing ?? randomUUID());
      res.setHeader('x-request-id', requestId);
      return requestId;
    },
    autoLogging: true,
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : { target: 'pino-pretty', options: { singleLine: true } },
  },
};
