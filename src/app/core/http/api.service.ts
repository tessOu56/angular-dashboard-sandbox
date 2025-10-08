import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  FilterParams,
} from '../../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // Generic GET request
  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams }).pipe(
      map((response) => this.handleResponse(response)),
      catchError((error) => this.handleError(error))
    );
  }

  // Generic POST request
  post<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data).pipe(
      map((response) => this.handleResponse(response)),
      catchError((error) => this.handleError(error))
    );
  }

  // Generic PUT request
  put<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data).pipe(
      map((response) => this.handleResponse(response)),
      catchError((error) => this.handleError(error))
    );
  }

  // Generic PATCH request
  patch<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data).pipe(
      map((response) => this.handleResponse(response)),
      catchError((error) => this.handleError(error))
    );
  }

  // Generic DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`).pipe(
      map((response) => this.handleResponse(response)),
      catchError((error) => this.handleError(error))
    );
  }

  // Paginated GET request
  getPaginated<T>(
    endpoint: string,
    pagination: PaginationParams,
    filters?: FilterParams
  ): Observable<PaginatedResponse<T>> {
    const params = {
      ...pagination,
      ...filters,
    };
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<ApiResponse<PaginatedResponse<T>>>(`${this.baseUrl}${endpoint}`, {
        params: httpParams,
      })
      .pipe(
        map((response) => this.handleResponse(response)),
        catchError((error) => this.handleError(error))
      );
  }

  // File upload
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData).pipe(
      map((response) => this.handleResponse(response)),
      catchError((error) => this.handleError(error))
    );
  }

  // File download
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}${endpoint}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          const blob = response.body;
          if (blob && filename) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
          }
          return blob!;
        }),
        catchError((error) => this.handleError(error))
      );
  }

  // SSE (Server-Sent Events)
  createEventSource(endpoint: string): EventSource {
    return new EventSource(`${this.baseUrl}${endpoint}`);
  }

  // WebSocket connection
  createWebSocket(endpoint: string): WebSocket {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${this.baseUrl}${endpoint}`;
    return new WebSocket(wsUrl);
  }

  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else if (value instanceof Date) {
            httpParams = httpParams.set(key, value.toISOString());
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data as T;
    } else {
      throw new Error(response.error || response.message || 'API request failed');
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      errorMessage = `HTTP ${error.status}: ${error.statusText}`;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
