export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000',
  sseUrl: 'http://localhost:3000/events',
  appName: 'Angular Sandbox',
  version: '1.0.0',
  features: {
    enableSSE: true,
    enableWebSocket: true,
    enableRealTimeEvents: true,
    enableAuditTrail: true,
    enableDualControl: true,
    enableHighRiskOperations: true,
  },
  logging: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  timeouts: {
    api: 30000,
    websocket: 60000,
    sse: 30000,
  },
  retry: {
    maxAttempts: 3,
    delay: 1000,
  },
};
