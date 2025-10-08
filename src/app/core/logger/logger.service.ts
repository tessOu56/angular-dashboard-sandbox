import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logLevel: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  critical(message: string, context?: string, data?: any): void {
    this.log(LogLevel.CRITICAL, message, context, data);
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      correlationId: this.getCurrentCorrelationId(),
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    this.outputToConsole(logEntry);

    // Send to external service in production
    if (environment.production && level >= LogLevel.ERROR) {
      this.sendToExternalService(logEntry);
    }
  }

  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const levelName = LogLevel[logEntry.level];
    const context = logEntry.context ? `[${logEntry.context}]` : '';
    const message = `${timestamp} ${levelName} ${context} ${logEntry.message}`;

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(message, logEntry.data);
        break;
      case LogLevel.INFO:
        console.info(message, logEntry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, logEntry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, logEntry.data);
        break;
    }
  }

  private sendToExternalService(logEntry: LogEntry): void {
    // In a real application, this would send logs to an external service
    // like Sentry, LogRocket, or a custom logging service
    fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    }).catch((error) => {
      console.error('Failed to send log to external service:', error);
    });
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth service or session storage
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private getCurrentSessionId(): string | undefined {
    // Get from session storage or generate
    return sessionStorage.getItem('sessionId') || undefined;
  }

  private getCurrentCorrelationId(): string | undefined {
    // Get from current request context
    return sessionStorage.getItem('correlationId') || undefined;
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter((log) => log.level >= level);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'context', 'message', 'userId', 'sessionId'];
      const rows = this.logs.map((log) => [
        log.timestamp.toISOString(),
        LogLevel[log.level],
        log.context || '',
        log.message,
        log.userId || '',
        log.sessionId || '',
      ]);

      return [headers, ...rows].map((row) => row.join(',')).join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }
}
