/**
 * Product Reviews Component
 * Displays product reviews and ratings
 */

import React, { useState, useEffect } from 'react';
import type { ProductReview, PaginatedResponse } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatRating } from '../../utils/marketplace';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadReviews();
  }, [productId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await marketplaceService.getProductReviews(productId, page, 10);
      setReviews(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="product-reviews__loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-reviews__error">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="product-reviews__empty">
        <h3>No reviews yet</h3>
        <p>Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="product-reviews">
      <h2>Customer Reviews ({pagination.total})</h2>

      <div className="product-reviews__list">
        {reviews.map((review) => (
          <div key={review.review_id} className="product-review">
            <div className="product-review__header">
              <div className="product-review__rating">
                {formatRating(review.rating)}
              </div>
              {review.is_verified_purchase && (
                <span className="product-review__verified">Verified Purchase</span>
              )}
              <span className="product-review__date">{formatDate(review.created_at)}</span>
            </div>

            {review.comment && (
              <p className="product-review__comment">{review.comment}</p>
            )}

            <div className="product-review__footer">
              {review.helpful_count > 0 && (
                <span className="product-review__helpful">
                  {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="product-reviews__pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="product-reviews__page-button"
          >
            Previous
          </button>
          <span className="product-reviews__page-info">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            className="product-reviews__page-button"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .product-reviews {
          padding: 24px 0;
        }

        .product-reviews h2 {
          font-size: 24px;
          margin: 0 0 24px 0;
          color: #333;
        }

        .product-reviews__loading,
        .product-reviews__error,
        .product-reviews__empty {
          text-align: center;
          padding: 48px 24px;
          color: #666;
        }

        .product-reviews__list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 24px;
        }

        .product-review {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        .product-review__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .product-review__rating {
          color: #FFA000;
          font-size: 16px;
          font-weight: 600;
        }

        .product-review__verified {
          padding: 4px 8px;
          background: #E8F5E9;
          color: #2E7D32;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-review__date {
          color: #999;
          font-size: 14px;
          margin-left: auto;
        }

        .product-review__comment {
          color: #333;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .product-review__footer {
          font-size: 14px;
        }

        .product-review__helpful {
          color: #666;
        }

        .product-reviews__pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 24px 0;
        }

        .product-reviews__page-button {
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .product-reviews__page-button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #1976D2;
        }

        .product-reviews__page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .product-reviews__page-info {
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ProductReviews;
