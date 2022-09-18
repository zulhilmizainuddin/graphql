import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (request) => request.url.includes('/metrics'),
    }),
    new FastifyInstrumentation(),
    new GraphQLInstrumentation(),
    new PinoInstrumentation(),
  ],
});

const provider = new NodeTracerProvider({
  resource: Resource.default().merge(new Resource({
    'service.name': 'gateway',
  })),
});

const zipkinExporter = new ZipkinExporter();

provider.addSpanProcessor(
  new SimpleSpanProcessor(zipkinExporter),
);

provider.register();
