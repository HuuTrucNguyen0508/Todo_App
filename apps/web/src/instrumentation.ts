// Server-side only instrumentation for Next.js
export async function register() {
  // Only initialize on server-side (Next.js SSR/API routes)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import Node.js modules only on server-side
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import(
      '@opentelemetry/auto-instrumentations-node'
    );
    const { OTLPTraceExporter } = await import(
      '@opentelemetry/exporter-trace-otlp-http'
    );
    const { Resource } = await import('@opentelemetry/resources');
    const { SemanticResourceAttributes } = await import(
      '@opentelemetry/semantic-conventions'
    );

    const traceExporter = new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        'http://jaeger:4318/v1/traces',
    });

    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'cursor-todo-web',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'todo-app',
      }),
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable file system tracing to reduce noise
          },
          '@opentelemetry/instrumentation-net': {
            enabled: false, // Disable low-level network tracing
          },
        }),
      ],
    });

    sdk.start();
    console.log('OpenTelemetry initialized for Next.js server-side');
  }
}
