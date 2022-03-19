import { register, Histogram, exponentialBuckets } from 'prom-client';

export const registerMetrics = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

export const histogram = new Histogram({
  name: 'operation_duration',
  help: 'Operation duration',
  labelNames: ['operationName'],
  buckets: exponentialBuckets(1, 2, 8),
});