import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

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
});
