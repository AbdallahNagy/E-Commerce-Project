import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginPayload, RegisterPayload } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly _currentUser = signal<User | null>(null);
  private readonly _loading = signal(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly loading = this._loading.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((res) => {
        localStorage.setItem('auth_token', res.token);
        this._currentUser.set(res.data);
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, payload).pipe(
      tap((res) => {
        localStorage.setItem('auth_token', res.token);
        this._currentUser.set(res.data);
      })
    );
  }

  getMe(): Observable<User | null> {
    this._loading.set(true);
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/auth/me`).pipe(
      tap((res) => {
        this._currentUser.set(res.data);
        this._loading.set(false);
      }),
      map((res) => res.data),
      catchError(() => {
        this._loading.set(false);
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  loadUserFromToken(): Observable<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return of(null);
    }
    return this.getMe();
  }

  get token(): string | null {
    return localStorage.getItem('auth_token');
  }
}
