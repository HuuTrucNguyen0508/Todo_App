// Client-side tracing utilities (browser-compatible)

// Simple no-op implementations for SSR compatibility
const noOpSpan = {
  setStatus: (status: any) => {},
  setAttribute: (key: string, value: any) => {},
  setAttributes: (attributes: any) => {},
  end: () => {},
};

const noOpTracer = {
  startSpan: (name: string) => noOpSpan,
};

// Export SpanKind for compatibility
export const SpanKind = {
  CLIENT: 3,
  SERVER: 2,
  INTERNAL: 0,
};

export interface TraceOptions {
  operation: string;
  attributes?: Record<string, string | number | boolean>;
  kind?: number;
}

/**
 * Trace an async operation with automatic error handling
 */
export async function traceAsyncOperation<T>(
  options: TraceOptions,
  operation: () => Promise<T>
): Promise<T> {
  const span = noOpTracer.startSpan(options.operation);

  try {
    const result = await operation();
    span.setStatus({ code: 'OK' });

    // Log the operation for debugging
    console.log(`[TRACE] ${options.operation}:`, {
      attributes: options.attributes,
      status: 'success',
    });

    return result;
  } catch (error) {
    span.setStatus({ code: 'ERROR' });

    // Log the error for debugging
    console.log(`[TRACE] ${options.operation}:`, {
      attributes: options.attributes,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  } finally {
    span.end();
  }
}

/**
 * Trace a synchronous operation
 */
export function traceSyncOperation<T>(
  options: TraceOptions,
  operation: () => T
): T {
  const span = noOpTracer.startSpan(options.operation);

  try {
    const result = operation();
    span.setStatus({ code: 'OK' });

    // Log the operation for debugging
    console.log(`[TRACE] ${options.operation}:`, {
      attributes: options.attributes,
      status: 'success',
    });

    return result;
  } catch (error) {
    span.setStatus({ code: 'ERROR' });

    // Log the error for debugging
    console.log(`[TRACE] ${options.operation}:`, {
      attributes: options.attributes,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  } finally {
    span.end();
  }
}

/**
 * Create a manual span for custom tracing
 */
export function createSpan(
  name: string,
  attributes?: Record<string, string | number | boolean>
) {
  console.log(`[TRACE] ${name}:`, { attributes });
  return noOpTracer.startSpan(name);
}

/**
 * Trace user interactions
 */
export function traceUserInteraction(action: string, target?: string) {
  // Log user interaction for debugging
  console.log(`[TRACE] user.${action}:`, {
    action,
    target: target || 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    timestamp: new Date().toISOString(),
  });

  return noOpSpan;
}

/**
 * Trace page navigation
 */
export function tracePageNavigation(from: string, to: string) {
  console.log(`[TRACE] page.navigation:`, {
    from,
    to,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Initialize client-side tracing (if needed)
 */
export function initializeClientTracing() {
  if (typeof window !== 'undefined') {
    console.log('[TRACE] Client-side tracing initialized:', {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
    });
  }
}
