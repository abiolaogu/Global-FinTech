/**
 * Marketplace API Service
 * Handles all marketplace-related API calls
 */

import type {
  MarketplaceCategory,
  MarketplacePartner,
  MarketplaceProduct,
  PartnerTransaction,
  ProductReview,
  PaginatedResponse,
  ListProductsFilters,
  PurchaseProductDto,
  AddReviewDto,
  ApiResponse,
} from '../types/marketplace';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class MarketplaceService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    // This should retrieve the JWT token from localStorage or cookies
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Categories
  async getCategories(): Promise<MarketplaceCategory[]> {
    const response = await this.request<MarketplaceCategory[]>('/marketplace/categories');
    return response.data || [];
  }

  // Partners
  async getPartners(country?: string, category?: string): Promise<MarketplacePartner[]> {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    if (category) params.append('category', category);

    const queryString = params.toString();
    const endpoint = queryString ? `/marketplace/partners?${queryString}` : '/marketplace/partners';

    const response = await this.request<MarketplacePartner[]>(endpoint);
    return response.data || [];
  }

  async getPartnerBySlug(slug: string): Promise<MarketplacePartner> {
    const response = await this.request<MarketplacePartner>(`/marketplace/partners/${slug}`);
    if (!response.data) {
      throw new Error('Partner not found');
    }
    return response.data;
  }

  // Products
  async listProducts(
    filters: ListProductsFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<MarketplaceProduct>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.category) params.append('category', filters.category);
    if (filters.partner_id) params.append('partner_id', filters.partner_id);
    if (filters.country) params.append('country', filters.country);
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await this.request<PaginatedResponse<MarketplaceProduct>>(
      `/marketplace/products?${params.toString()}`
    );

    return response.data || { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
  }

  async getProduct(identifier: string): Promise<MarketplaceProduct> {
    const response = await this.request<MarketplaceProduct>(`/marketplace/products/${identifier}`);
    if (!response.data) {
      throw new Error('Product not found');
    }
    return response.data;
  }

  async getFeaturedProducts(country?: string, limit: number = 10): Promise<MarketplaceProduct[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (country) params.append('country', country);

    const response = await this.request<MarketplaceProduct[]>(
      `/marketplace/featured?${params.toString()}`
    );
    return response.data || [];
  }

  async getTrendingProducts(country?: string, limit: number = 10): Promise<MarketplaceProduct[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (country) params.append('country', country);

    const response = await this.request<MarketplaceProduct[]>(
      `/marketplace/trending?${params.toString()}`
    );
    return response.data || [];
  }

  // Transactions
  async purchaseProduct(
    productIdentifier: string,
    dto: Omit<PurchaseProductDto, 'product_id'>
  ): Promise<PartnerTransaction> {
    const response = await this.request<PartnerTransaction>(
      `/marketplace/products/${productIdentifier}/purchase`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      }
    );
    if (!response.data) {
      throw new Error('Purchase failed');
    }
    return response.data;
  }

  async getUserTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<PartnerTransaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.request<PaginatedResponse<PartnerTransaction>>(
      `/marketplace/transactions?${params.toString()}`
    );

    return response.data || { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
  }

  async getTransaction(reference: string): Promise<PartnerTransaction> {
    const response = await this.request<PartnerTransaction>(
      `/marketplace/transactions/${reference}`
    );
    if (!response.data) {
      throw new Error('Transaction not found');
    }
    return response.data;
  }

  // Reviews
  async addReview(
    transactionId: string,
    dto: AddReviewDto
  ): Promise<ProductReview> {
    const response = await this.request<ProductReview>(
      `/marketplace/transactions/${transactionId}/review`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      }
    );
    if (!response.data) {
      throw new Error('Failed to submit review');
    }
    return response.data;
  }

  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ProductReview>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.request<PaginatedResponse<ProductReview>>(
      `/marketplace/products/${productId}/reviews?${params.toString()}`
    );

    return response.data || { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;
