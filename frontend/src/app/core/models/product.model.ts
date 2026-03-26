export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  stock: number;
  images: string[];
  averageRating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Product[];
}

export interface ProductParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
