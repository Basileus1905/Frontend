// src/app/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

// Ensure this interface is defined
interface User {
  username: string;
  token?: string;
  // Add other properties if needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  // Use a consistent token key - we'll use 'auth_token'
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {
    // Check if token exists in localStorage and is valid
    this.loadStoredUser();
  }

  getToken(): string | null {
    // Use the consistent TOKEN_KEY
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(this.API_URL.concat('/login'), credentials).pipe(
      tap(response => {
        console.log('Auth service login response:', response);

        // Save the token to localStorage
        if (response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);

          // Create a user object from credentials and token
          const user: User = {
            username: credentials.username,
            token: response.token
          };

          // Update current user state
          this.currentUserSubject.next(user);
          console.log('User state updated after login:', user);
        }
      })
    );
  }

  logout(): void {
    // Clear BOTH token keys to be safe
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('token');

    // Update current user
    this.currentUserSubject.next(null);
    console.log('User logged out, state cleared');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Helper method to safely check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider expired if we can't parse it
    }
  }

  private loadStoredUser(): void {
    const token = this.getToken();

    if (!token) {
      console.log('No token found in storage');
      return;
    }

    try {
      if (!this.isTokenExpired(token)) {
        // Try to decode token
        const decodedToken = this.jwtHelper.decodeToken(token);
        console.log('Decoded token:', decodedToken);

        // Get username from token or use a default
        const username = decodedToken?.username || decodedToken?.sub || 'User';

        const user: User = {
          username: username,
          token: token
        };

        this.currentUserSubject.next(user);
        console.log('Loaded user from storage:', user);
      } else {
        console.log('Stored token is expired');
        this.logout();
      }
    } catch (error) {
      console.error('Error parsing token', error);
      this.logout();
    }
  }
}
