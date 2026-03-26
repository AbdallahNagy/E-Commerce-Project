import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;
  private readonly _cart = signal<Cart | null>(null);
  private readonly _loading = signal(false);

  readonly cart = this._cart.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly cartItemCount = computed(() => {
    const cart = this._cart();
    return cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  });
  readonly cartTotal = computed(() => this._cart()?.totalPrice ?? 0);

  constructor(private http: HttpClient) {}

  getCart(): Observable<{ success: boolean; data: Cart }> {
    this._loading.set(true);
    return this.http.get<{ success: boolean; data: Cart }>(this.apiUrl).pipe(
      tap((res) => {
        this._cart.set(res.data);
        this._loading.set(false);
      })
    );
  }

  addToCart(productId: string, quantity: number = 1): Observable<{ success: boolean; data: Cart }> {
    return this.http.post<{ success: boolean; data: Cart }>(this.apiUrl, { productId, quantity }).pipe(
      tap((res) => this._cart.set(res.data))
    );
  }

  updateItem(itemId: string, quantity: number): Observable<{ success: boolean; data: Cart }> {
    return this.http.put<{ success: boolean; data: Cart }>(`${this.apiUrl}/${itemId}`, { quantity }).pipe(
      tap((res) => this._cart.set(res.data))
    );
  }

  removeItem(itemId: string): Observable<{ success: boolean; data: Cart }> {
    return this.http.delete<{ success: boolean; data: Cart }>(`${this.apiUrl}/${itemId}`).pipe(
      tap((res) => this._cart.set(res.data))
    );
  }

  clearCart(): Observable<{ success: boolean; data: null }> {
    return this.http.delete<{ success: boolean; data: null }>(this.apiUrl).pipe(
      tap(() => this._cart.set(null))
    );
  }

  resetLocal(): void {
    this._cart.set(null);
  }
}
