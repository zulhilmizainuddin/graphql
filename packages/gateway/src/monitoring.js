import { register, Histogram, exponentialBuckets } from 'prom-client';

export const registerMetrics = async (request, reply) => {
  reply.header('Content-Type', register.contentType);
  reply.send(await register.metrics());
};

export const histogram = new Histogram({
  name: 'operation_duration',
  help: 'Operation duration',
  labelNames: ['operationName'],
  buckets: exponentialBuckets(1, 2, 8),
});
