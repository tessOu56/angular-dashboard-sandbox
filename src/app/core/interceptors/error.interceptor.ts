import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request';
            break;
          case 401:
            errorMessage = 'Unauthorized';
            break;
          case 403:
            errorMessage = 'Forbidden';
            break;
          case 404:
            errorMessage = 'Not Found';
            break;
          case 500:
            errorMessage = 'Internal Server Error';
            break;
          case 502:
            errorMessage = 'Bad Gateway';
            break;
          case 503:
            errorMessage = 'Service Unavailable';
            break;
          default:
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }

      // Log error
      logger.error(
        'HTTP Error',
        `URL: ${request.url}, Method: ${request.method}, Status: ${error.status}, Message: ${errorMessage}`
      );

      return throwError(() => new Error(errorMessage));
    })
  );
};
