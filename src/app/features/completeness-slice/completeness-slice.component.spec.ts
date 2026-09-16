import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CompletenessSliceComponent } from './completeness-slice.component';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/auth/permission.service';
import { Permission } from '../../../shared/sdk';

describe('CompletenessSliceComponent', () => {
  let fixture: ComponentFixture<CompletenessSliceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletenessSliceComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    const permissions = TestBed.inject(PermissionService);
    permissions.setPermissions(Object.values(Permission));
    const auth = TestBed.inject(AuthService);
    auth.login({ username: 'admin', password: 'admin' }).subscribe();

    fixture = TestBed.createComponent(CompletenessSliceComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('renders the login-to-slice completeness path', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="completeness-slice"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="slice-approvals"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="slice-audit"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="slice-sse"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="slice-charts"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="sse-status"]')?.textContent).toContain('Connected');
  });
});
