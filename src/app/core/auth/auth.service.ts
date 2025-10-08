import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  User,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  SessionInfo,
  AuthState,
  Permission,
  UserRole,
} from '../../../shared/sdk';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private permissionService = inject(PermissionService);

  // Signals for reactive state management
  private _authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    permissions: [],
    loading: false,
    error: null,
  });

  // Public readonly signals
  public readonly authState = this._authState.asReadonly();
  public readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  public readonly user = computed(() => this._authState().user);
  public readonly permissions = computed(() => this._authState().permissions);
  public readonly loading = computed(() => this._authState().loading);
  public readonly error = computed(() => this._authState().error);

  // Computed signals for role-based access
  public readonly isAdmin = computed(
    () =>
      this._authState().user?.role === UserRole.ADMIN ||
      this._authState().user?.role === UserRole.SUPER_ADMIN
  );

  public readonly isManager = computed(() => this._authState().user?.role === UserRole.MANAGER);

  public readonly isApprover = computed(
    () => this._authState().user?.role === UserRole.APPROVER || this.isManager()
  );

  public readonly userRole = computed(() => this._authState().user?.role);

  // Legacy BehaviorSubject for compatibility
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._authState.update((state) => ({
          ...state,
          isAuthenticated: true,
          user,
          token,
          refreshToken,
          permissions: user.permissions || [],
        }));
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._authState.update((state) => ({ ...state, loading: true, error: null }));

    // Mock login for development
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      const mockUser: User = {
        id: '1',
        username: 'admin',
        email: 'admin@company.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        department: 'IT',
        isActive: true,
        permissions: Object.values(Permission),
        timezone: 'UTC',
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      };

      const mockResponse: LoginResponse = {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        permissions: Object.values(Permission),
      };

      return of(mockResponse).pipe(
        tap((response) => this.setAuthState(response)),
        catchError((error) => {
          this._authState.update((state) => ({ ...state, loading: false, error: error.message }));
          return throwError(() => error);
        })
      );
    }

    // Invalid credentials in development mode
    this._authState.update((state) => ({ ...state, loading: false, error: 'Invalid credentials' }));
    return throwError(() => new Error('Invalid username or password'));

    // Real API call would be here in production:
    // return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
    //   tap((response) => this.setAuthState(response)),
    //   catchError((error) => {
    //     this._authState.update((state) => ({ ...state, loading: false, error: error.message }));
    //     return throwError(() => error);
    //   })
    // );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this._authState().refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<LoginResponse>('/api/auth/refresh', request).pipe(
      tap((response) => this.setAuthState(response)),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  hasPermission(permission: Permission): boolean {
    return this._authState().permissions.includes(permission);
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  canAccessRoute(route: string): boolean {
    const user = this._authState().user;
    if (!user) return false;

    // Route-based access control
    switch (route) {
      case '/admin':
        return this.isAdmin();
      case '/approvals':
        return this.hasAnyPermission([Permission.VIEW_APPROVALS, Permission.APPROVE_REQUESTS]);
      case '/flags':
        return this.hasAnyPermission([Permission.VIEW_FLAGS, Permission.MANAGE_FLAGS]);
      case '/events':
        return this.hasAnyPermission([Permission.VIEW_EVENTS, Permission.MANAGE_EVENTS]);
      case '/settings':
        return this.hasAnyPermission([Permission.VIEW_SETTINGS, Permission.MANAGE_SETTINGS]);
      case '/audit':
        return this.hasPermission(Permission.VIEW_AUDIT_TRAIL);
      default:
        return true;
    }
  }

  getSessionInfo(): SessionInfo | null {
    const user = this._authState().user;
    if (!user) return null;

    return {
      user,
      permissions: this._authState().permissions,
      roles: [user.role],
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      isExpired: false,
    };
  }

  private setAuthState(response: LoginResponse): void {
    const { user, token, refreshToken } = response;

    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    // Update signals
    this._authState.set({
      isAuthenticated: true,
      user,
      token,
      refreshToken,
      permissions: user.permissions || [],
      loading: false,
      error: null,
    });

    // Update permission service
    this.permissionService.setPermissions(user.permissions || []);

    // Update BehaviorSubject for compatibility
    this.currentUserSubject.next(user);
  }

  private clearAuth(): void {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Reset signals
    this._authState.set({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      permissions: [],
      loading: false,
      error: null,
    });

    // Clear permission service
    this.permissionService.clearPermissions();

    // Reset BehaviorSubject
    this.currentUserSubject.next(null);
  }
}
