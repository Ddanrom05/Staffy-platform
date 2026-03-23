import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeToTerms: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (!this.agreeToTerms) {
      alert('Debes aceptar los Términos del servicio y la Política de privacidad.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.http
      .post<{ id: number; fullName: string; email: string; role: string }>('/api/auth/sign-up', {
        fullName: this.fullName,
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
          alert('Cuenta creada con éxito.');
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            'No pudimos crear tu cuenta en este momento. Inténtalo de nuevo.';
          alert(message);
        },
      });
  }
}
