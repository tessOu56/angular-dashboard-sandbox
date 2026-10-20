import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { SkipLinkComponent } from './shared/ui/skip-link/skip-link.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, SkipLinkComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('AlloyLab Platform');

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // AuthService rehydrates from the mock catalog. Do not treat a leftover
    // localStorage `user` key as proof of a session.
    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login']);
    }
  }
}
