import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService, MOCK_ACCESS_TOKEN } from './auth.service';
import { Permission, UserRole } from '../../../shared/sdk';

describe('AuthService sandbox login', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([]), AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('logs in documented demo accounts', () => {
    service.login({ username: 'admin', password: 'admin' }).subscribe((response) => {
      expect(response.user.username).toBe('admin');
      expect(service.isAuthenticated()).toBe(true);
    });
    service.login({ username: 'manager', password: 'manager' }).subscribe((response) => {
      expect(response.user.role).toBe('manager');
    });
  });

  it('rejects unknown credentials', (done) => {
    service.login({ username: 'admin', password: 'wrong' }).subscribe({
      next: () => done.fail('expected login to fail'),
      error: (error) => {
        expect(error.message).toContain('Invalid');
        expect(service.isAuthenticated()).toBe(false);
        done();
      },
    });
  });

  it('rehydrates role and permissions from the mock catalog, not localStorage', () => {
    localStorage.setItem('auth_token', MOCK_ACCESS_TOKEN);
    localStorage.setItem(
      'user',
      JSON.stringify({
        username: 'employee',
        role: 'admin',
        permissions: ['*'],
      })
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([]), AuthService],
    });
    const rehydrated = TestBed.inject(AuthService);

    expect(rehydrated.isAuthenticated()).toBe(true);
    expect(rehydrated.user()?.role).toBe(UserRole.OPERATOR);
    expect(rehydrated.isAdmin()).toBe(false);
    expect(rehydrated.hasPermission(Permission.MANAGE_FLAGS)).toBe(false);
  });

  it('clears a session when the stored token is not the mock token', () => {
    localStorage.setItem('auth_token', 'forged-token');
    localStorage.setItem('user', JSON.stringify({ username: 'admin', permissions: ['*'] }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([]), AuthService],
    });
    const rehydrated = TestBed.inject(AuthService);

    expect(rehydrated.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
