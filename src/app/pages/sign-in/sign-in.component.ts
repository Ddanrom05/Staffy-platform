import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.http
      .post<{ id: number; fullName: string; email: string; role: string }>('/api/auth/sign-in', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          localStorage.setItem('staffy_session', 'active');
          localStorage.setItem('staffy_user_id', String(response.id));
          localStorage.setItem('staffy_role', response.role);
          localStorage.setItem('staffy_user_name', response.fullName);
          localStorage.setItem('staffy_user_email', response.email);
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          const message =
            error?.error?.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.';
          alert(message);
        },
      });
  }
}
