import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category, ProductParams } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, PaginationComponent, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);

  searchInput = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedSort = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data),
    });

    this.route.queryParams.subscribe((params) => {
      this.searchInput = params['search'] || '';
      this.selectedCategory = params['category'] || '';
      this.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.selectedSort = params['sort'] || '';
      this.currentPage.set(params['page'] ? +params['page'] : 1);
      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.loading.set(true);
    const params: ProductParams = {
      page: this.currentPage(),
      limit: 12,
    };

    if (this.searchInput) params.search = this.searchInput;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.minPrice !== null) params.minPrice = this.minPrice;
    if (this.maxPrice !== null) params.maxPrice = this.maxPrice;
    if (this.selectedSort) params.sort = this.selectedSort;

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.pages);
        this.currentPage.set(res.page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters(): void {
    const queryParams: Record<string, string | number | undefined> = {};
    if (this.searchInput) queryParams['search'] = this.searchInput;
    if (this.selectedCategory) queryParams['category'] = this.selectedCategory;
    if (this.minPrice !== null) queryParams['minPrice'] = this.minPrice;
    if (this.maxPrice !== null) queryParams['maxPrice'] = this.maxPrice;
    if (this.selectedSort) queryParams['sort'] = this.selectedSort;

    this.router.navigate(['/products'], { queryParams });
  }

  clearFilters(): void {
    this.searchInput = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedSort = '';
    this.router.navigate(['/products']);
  }

  onPageChange(page: number): void {
    const queryParams: Record<string, string | number> = {};
    if (this.searchInput) queryParams['search'] = this.searchInput;
    if (this.selectedCategory) queryParams['category'] = this.selectedCategory;
    if (this.minPrice !== null) queryParams['minPrice'] = this.minPrice;
    if (this.maxPrice !== null) queryParams['maxPrice'] = this.maxPrice;
    if (this.selectedSort) queryParams['sort'] = this.selectedSort;
    queryParams['page'] = page;

    this.router.navigate(['/products'], { queryParams });
  }
}
