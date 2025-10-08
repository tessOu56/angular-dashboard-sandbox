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
    // Check authentication on app init
    const user = this.authService.user();
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        this.router.navigate(['/login']);
      }
    }
  }
}
