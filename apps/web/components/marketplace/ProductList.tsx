/**
 * Product List Component
 * Displays a paginated grid of marketplace products
 */

import React, { useState, useEffect } from 'react';
import type { MarketplaceProduct, ListProductsFilters, PaginatedResponse } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { ProductCard } from './ProductCard';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface ProductListProps {
  filters?: ListProductsFilters;
  onProductClick?: (product: MarketplaceProduct) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ filters = {}, onProductClick }) => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadProducts();
  }, [filters, page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await marketplaceService.listProducts(filters, page, 20);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="product-list__loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadProducts}
      />
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-list__empty">
        <h3>No products found</h3>
        <p>Try adjusting your filters or check back later for new products.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="product-list__header">
        <h2>Products</h2>
        <p className="product-list__count">
          Showing {products.length} of {pagination.total} products
        </p>
      </div>

      <div className="product-list__grid">
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            onProductClick={onProductClick}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="product-list__pagination">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <style jsx>{`
        .product-list {
          padding: 24px;
        }

        .product-list__loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .product-list__empty {
          text-align: center;
          padding: 64px 24px;
          color: #666;
        }

        .product-list__empty h3 {
          font-size: 24px;
          margin-bottom: 12px;
          color: #333;
        }

        .product-list__header {
          margin-bottom: 24px;
        }

        .product-list__header h2 {
          font-size: 28px;
          margin: 0 0 8px 0;
          color: #333;
        }

        .product-list__count {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .product-list__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .product-list__pagination {
          display: flex;
          justify-content: center;
          padding: 24px 0;
        }

        @media (max-width: 768px) {
          .product-list {
            padding: 16px;
          }

          .product-list__grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductList;
