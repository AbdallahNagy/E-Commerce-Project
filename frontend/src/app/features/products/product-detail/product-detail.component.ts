import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { ReviewService } from '../../../core/services/review.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Category } from '../../../core/models/product.model';
import { Review } from '../../../core/models/review.model';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, StarRatingComponent, LoadingSpinnerComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  selectedImage = signal('');
  quantity = signal(1);
  addingToCart = signal(false);
  reviewRating = signal(0);
  reviewComment = '';
  submittingReview = signal(false);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cartService: CartService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product.set(res.data);
        if (res.data.images?.length) {
          this.selectedImage.set(res.data.images[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.reviewService.getProductReviews(id).subscribe({
      next: (res) => this.reviews.set(res.data),
    });
  }

  categoryName(): string {
    const cat = this.product()?.category;
    if (cat && typeof cat === 'object') return (cat as Category).name;
    return '';
  }

  getCategoryId(): string {
    const cat = this.product()?.category;
    if (cat && typeof cat === 'object') return (cat as Category)._id;
    return cat as string;
  }

  getReviewUserName(review: Review): string {
    if (typeof review.user === 'object') return review.user.name;
    return 'User';
  }

  increaseQty(): void {
    const max = this.product()?.stock ?? 1;
    if (this.quantity() < max) this.quantity.update((q) => q + 1);
  }

  decreaseQty(): void {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }

  addToCart(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.error('Please login to add items to cart');
      return;
    }

    this.addingToCart.set(true);
    this.cartService.addToCart(this.product()!._id, this.quantity()).subscribe({
      next: () => {
        this.toast.success('Added to cart!');
        this.addingToCart.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to add to cart');
        this.addingToCart.set(false);
      },
    });
  }

  submitReview(): void {
    if (this.reviewRating() === 0) {
      this.toast.error('Please select a rating');
      return;
    }
    if (!this.reviewComment.trim()) {
      this.toast.error('Please write a comment');
      return;
    }

    this.submittingReview.set(true);
    this.reviewService.createReview(this.product()!._id, {
      rating: this.reviewRating(),
      comment: this.reviewComment.trim(),
    }).subscribe({
      next: (res) => {
        this.reviews.update((r) => [res.data, ...r]);
        this.reviewRating.set(0);
        this.reviewComment = '';
        this.submittingReview.set(false);
        this.toast.success('Review submitted!');
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.toast.error(err.error?.message || 'Failed to submit review');
      },
    });
  }
}
