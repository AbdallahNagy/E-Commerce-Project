import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ToastService);
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);

  placing = signal(false);

  form = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zip: ['', Validators.required],
    country: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cartService.getCart().subscribe();

    const user = this.auth.currentUser();
    if (user?.address) {
      this.form.patchValue({
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zip: user.address.zip || '',
        country: user.address.country || '',
      });
    }
  }

  placeOrder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.placing.set(true);
    const shippingAddress = this.form.getRawValue() as {
      street: string; city: string; state: string; zip: string; country: string;
    };

    this.orderService.createOrder({ shippingAddress }).subscribe({
      next: (res: any) => {
        this.cartService.resetLocal();
        this.toast.success('Order placed successfully!');
        this.router.navigate(['/orders', res.data._id]);
      },
      error: (err: any) => {
        this.placing.set(false);
        this.toast.error(err.error?.message || 'Failed to place order');
      },
    });
  }
}
