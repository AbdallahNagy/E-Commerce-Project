import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './orders-list.component.html',
})
export class OrdersListComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
