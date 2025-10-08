import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Add auth token to request
  const authRequest = addTokenToRequest(request, authService);

  return next(authRequest).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authRequest, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(
  request: HttpRequest<unknown>,
  authService: AuthService
): HttpRequest<unknown> {
  const token = authService.authState().token;

  if (token) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  return request;
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.token);
        return next(addTokenToRequest(request, authService));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap(() => next(addTokenToRequest(request, authService)))
  );
}
