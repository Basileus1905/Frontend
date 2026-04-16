// src/app/auth/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Add debugging log
    console.log('Attempting login with username:', this.loginForm.value.username);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login response received:', response);

        // Check if the response contains a token
        if (response && response.token) {
          console.log('Token received, navigating to home');

          // Add a small delay to ensure state is updated before navigation
          setTimeout(() => {
            this.isSubmitting = false;
            this.router.navigate(['/']);
          }, 100);
        } else {
          console.warn('No token in response');
          this.isSubmitting = false;
          this.errorMessage = 'Login successful but no token received';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      },
      complete: () => {
        console.log('Login request complete');
      }
    });
  }
}
