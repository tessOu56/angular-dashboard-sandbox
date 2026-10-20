export const environment = {
  production: true,
  apiUrl: '/api',
  wsUrl: '',
  sseUrl: 'mock',
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
    level: 'warn',
    enableConsole: false,
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
