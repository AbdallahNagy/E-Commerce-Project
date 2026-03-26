import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, CreateReviewPayload } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: string): Observable<{ success: boolean; data: Review[] }> {
    return this.http.get<{ success: boolean; data: Review[] }>(
      `${this.apiUrl}/products/${productId}/reviews`
    );
  }

  createReview(productId: string, payload: CreateReviewPayload): Observable<{ success: boolean; data: Review }> {
    return this.http.post<{ success: boolean; data: Review }>(
      `${this.apiUrl}/products/${productId}/reviews`,
      payload
    );
  }

  updateReview(id: string, payload: Partial<CreateReviewPayload>): Observable<{ success: boolean; data: Review }> {
    return this.http.put<{ success: boolean; data: Review }>(
      `${this.apiUrl}/reviews/${id}`,
      payload
    );
  }

  deleteReview(id: string): Observable<{ success: boolean; data: null }> {
    return this.http.delete<{ success: boolean; data: null }>(`${this.apiUrl}/reviews/${id}`);
  }
}
