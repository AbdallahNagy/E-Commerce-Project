import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);
  cancelling = signal(false);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrder(id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancelOrder(): void {
    this.cancelling.set(true);
    this.orderService.cancelOrder(this.order()!._id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.cancelling.set(false);
        this.toast.success('Order cancelled successfully');
      },
      error: (err) => {
        this.cancelling.set(false);
        this.toast.error(err.error?.message || 'Failed to cancel order');
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'processing': return 'badge-yellow';
      case 'shipped': return 'badge-blue';
      case 'delivered': return 'badge-green';
      case 'cancelled': return 'badge-red';
      default: return 'badge-gray';
    }
  }

  getPaymentClass(status: string): string {
    switch (status) {
      case 'paid': return 'badge-green';
      case 'pending': return 'badge-yellow';
      case 'failed': return 'badge-red';
      default: return 'badge-gray';
    }
  }
}
