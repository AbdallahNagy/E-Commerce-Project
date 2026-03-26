import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  constructor(public cartService: CartService, private toast: ToastService) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe();
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    this.cartService.updateItem(itemId, quantity).subscribe({
      error: (err: any) => this.toast.error(err.error?.message || 'Failed to update quantity'),
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.toast.success('Item removed'),
      error: (err: any) => this.toast.error(err.error?.message || 'Failed to remove item'),
    });
  }
}
