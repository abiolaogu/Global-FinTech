/**
 * Category Grid Component
 * Displays marketplace categories in a grid layout
 */

import React, { useState, useEffect } from 'react';
import type { MarketplaceCategory } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { getCategoryIcon } from '../../utils/marketplace';

interface CategoryGridProps {
  onCategoryClick?: (category: MarketplaceCategory) => void;
  showFeaturedOnly?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onCategoryClick,
  showFeaturedOnly = false,
}) => {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceService.getCategories();

      let filteredData = data.filter(cat => cat.is_active);
      if (showFeaturedOnly) {
        filteredData = filteredData.filter(cat => cat.is_featured);
      }

      // Sort by display order
      filteredData.sort((a, b) => a.display_order - b.display_order);

      setCategories(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="category-grid__loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadCategories}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <div className="category-grid__empty">
        <p>No categories available</p>
      </div>
    );
  }

  return (
    <div className="category-grid">
      <div className="category-grid__header">
        <h2>Browse Categories</h2>
      </div>

      <div className="category-grid__items">
        {categories.map((category) => (
          <div
            key={category.category_id}
            className="category-card"
            onClick={() => onCategoryClick && onCategoryClick(category)}
            role={onCategoryClick ? 'button' : undefined}
            tabIndex={onCategoryClick ? 0 : undefined}
          >
            {category.is_featured && (
              <div className="category-card__badge">Featured</div>
            )}

            {category.banner_url ? (
              <div className="category-card__banner">
                <img
                  src={category.banner_url}
                  alt={category.name}
                  className="category-card__banner-img"
                />
              </div>
            ) : (
              <div className="category-card__icon">
                {category.icon_url ? (
                  <img src={category.icon_url} alt={category.name} />
                ) : (
                  <span>{getCategoryIcon(category.slug)}</span>
                )}
              </div>
            )}

            <div className="category-card__content">
              <h3 className="category-card__name">{category.name}</h3>
              {category.description && (
                <p className="category-card__description">{category.description}</p>
              )}
              <div className="category-card__count">
                {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .category-grid {
          padding: 24px;
        }

        .category-grid__loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .category-grid__empty {
          text-align: center;
          padding: 48px 24px;
          color: #666;
        }

        .category-grid__header {
          margin-bottom: 24px;
        }

        .category-grid__header h2 {
          font-size: 28px;
          margin: 0;
          color: #333;
        }

        .category-grid__items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .category-card {
          position: relative;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .category-card[role='button'] {
          cursor: pointer;
        }

        .category-card[role='button']:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
          border-color: #1976D2;
        }

        .category-card__badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 10px;
          background: #4CAF50;
          color: white;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          z-index: 1;
        }

        .category-card__banner {
          width: 100%;
          height: 120px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .category-card__banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-card__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-size: 48px;
        }

        .category-card__icon img {
          max-width: 64px;
          max-height: 64px;
          object-fit: contain;
        }

        .category-card__content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .category-card__name {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #333;
        }

        .category-card__description {
          font-size: 13px;
          color: #666;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .category-card__count {
          font-size: 12px;
          color: #1976D2;
          font-weight: 600;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .category-grid {
            padding: 16px;
          }

          .category-grid__items {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          }

          .category-card__icon {
            height: 80px;
            font-size: 32px;
          }

          .category-card__banner {
            height: 80px;
          }

          .category-card__content {
            padding: 12px;
          }

          .category-card__name {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryGrid;
