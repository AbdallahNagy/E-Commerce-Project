export interface Review {
  _id: string;
  user: { _id: string; name: string } | string;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  rating: number;
  comment: string;
}
