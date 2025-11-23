/**
 * Product Card Component
 * Displays a marketplace product in a card format
 */

import React from 'react';
import type { MarketplaceProduct } from '../../types/marketplace';
import { formatCurrency, formatRating } from '../../utils/marketplace';

interface ProductCardProps {
  product: MarketplaceProduct;
  onProductClick?: (product: MarketplaceProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const displayPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < (product.price || 0);

  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div
      className="product-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="product-card__image-container">
        {product.is_featured && (
          <div className="product-card__badge product-card__badge--featured">
            Featured
          </div>
        )}
        {hasDiscount && (
          <div className="product-card__badge product-card__badge--discount">
            {Math.round(((product.price! - product.discount_price!) / product.price!) * 100)}% OFF
          </div>
        )}
        <img
          src={product.thumbnail_url || product.images[0] || '/placeholder-product.png'}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
      </div>

      <div className="product-card__content">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__description">{product.short_description}</p>

        {product.partner && (
          <div className="product-card__partner">
            <img
              src={product.partner.logo_url || '/placeholder-partner.png'}
              alt={product.partner.name}
              className="product-card__partner-logo"
            />
            <span className="product-card__partner-name">{product.partner.name}</span>
          </div>
        )}

        <div className="product-card__rating">
          <span className="product-card__rating-stars">
            {formatRating(product.rating)}
          </span>
          <span className="product-card__rating-count">
            ({product.review_count})
          </span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__pricing">
            {hasDiscount && (
              <span className="product-card__original-price">
                {formatCurrency(product.price!, product.currency)}
              </span>
            )}
            <span className="product-card__current-price">
              {formatCurrency(displayPrice!, product.currency)}
            </span>
          </div>

          {product.requires_shipping && (
            <div className="product-card__shipping">
              {product.shipping_cost === 0 ? (
                <span className="product-card__free-shipping">Free Shipping</span>
              ) : (
                <span className="product-card__shipping-cost">
                  + {formatCurrency(product.shipping_cost!, product.currency)} shipping
                </span>
              )}
            </div>
          )}

          {product.stock_quantity !== null && product.stock_quantity <= (product.low_stock_threshold || 10) && (
            <div className="product-card__stock-warning">
              Only {product.stock_quantity} left!
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .product-card__image-container {
          position: relative;
          width: 100%;
          padding-top: 100%;
          background: #f5f5f5;
          overflow: hidden;
        }

        .product-card__image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-card__badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          z-index: 1;
        }

        .product-card__badge--featured {
          background: #4CAF50;
          color: white;
        }

        .product-card__badge--discount {
          background: #FF5722;
          color: white;
          top: 44px;
        }

        .product-card__content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-card__title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #333;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card__description {
          font-size: 14px;
          color: #666;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card__partner {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .product-card__partner-logo {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin-right: 8px;
          object-fit: cover;
        }

        .product-card__partner-name {
          font-size: 12px;
          color: #666;
        }

        .product-card__rating {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .product-card__rating-stars {
          color: #FFA000;
          margin-right: 4px;
        }

        .product-card__rating-count {
          color: #999;
          font-size: 12px;
        }

        .product-card__footer {
          margin-top: auto;
        }

        .product-card__pricing {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
        }

        .product-card__original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }

        .product-card__current-price {
          font-size: 20px;
          font-weight: 700;
          color: #1976D2;
        }

        .product-card__shipping {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .product-card__free-shipping {
          color: #4CAF50;
          font-weight: 600;
        }

        .product-card__shipping-cost {
          color: #666;
        }

        .product-card__stock-warning {
          font-size: 12px;
          color: #FF5722;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
