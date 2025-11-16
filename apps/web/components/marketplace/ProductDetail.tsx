/**
 * Product Detail Component
 * Displays detailed product information and purchase options
 */

import React, { useState, useEffect } from 'react';
import type { MarketplaceProduct, ProductReview, PaginatedResponse } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { ProductReviews } from './ProductReviews';
import { PurchaseModal } from './PurchaseModal';
import { formatCurrency, formatRating } from '../../utils/marketplace';

interface ProductDetailProps {
  productId: string;
  onPurchaseComplete?: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onPurchaseComplete }) => {
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceService.getProduct(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const minQty = product?.min_purchase_quantity || 1;
    const maxQty = product?.max_purchase_quantity || product?.stock_quantity || 999;

    if (newQuantity >= minQty && newQuantity <= maxQty) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = () => {
    setShowPurchaseModal(true);
  };

  if (loading) {
    return (
      <div className="product-detail__loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <ErrorMessage
        message={error || 'Product not found'}
        onRetry={loadProduct}
      />
    );
  }

  const displayPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < (product.price || 0);
  const totalPrice = (displayPrice || 0) * quantity + (product.shipping_cost || 0);
  const images = product.images.length > 0 ? product.images : [product.thumbnail_url || '/placeholder-product.png'];

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        {/* Image Gallery */}
        <div className="product-detail__gallery">
          <div className="product-detail__main-image">
            {product.is_featured && (
              <div className="product-detail__badge product-detail__badge--featured">
                Featured
              </div>
            )}
            {hasDiscount && (
              <div className="product-detail__badge product-detail__badge--discount">
                {Math.round(((product.price! - product.discount_price!) / product.price!) * 100)}% OFF
              </div>
            )}
            <img
              src={images[selectedImageIndex]}
              alt={product.name}
              className="product-detail__image"
            />
          </div>

          {images.length > 1 && (
            <div className="product-detail__thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} - ${index + 1}`}
                  className={`product-detail__thumbnail ${
                    index === selectedImageIndex ? 'product-detail__thumbnail--active' : ''
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          )}

          {product.video_url && (
            <div className="product-detail__video">
              <video controls>
                <source src={product.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-detail__info">
          <h1 className="product-detail__title">{product.name}</h1>

          {product.partner && (
            <div className="product-detail__partner">
              <img
                src={product.partner.logo_url || '/placeholder-partner.png'}
                alt={product.partner.name}
                className="product-detail__partner-logo"
              />
              <div>
                <div className="product-detail__partner-name">{product.partner.name}</div>
                <div className="product-detail__partner-rating">
                  {formatRating(product.partner.rating)} ({product.partner.review_count} reviews)
                </div>
              </div>
            </div>
          )}

          <div className="product-detail__rating">
            <span className="product-detail__rating-stars">
              {formatRating(product.rating)}
            </span>
            <span className="product-detail__rating-count">
              ({product.review_count} reviews)
            </span>
            <span className="product-detail__sales-count">
              {product.total_sales} sold
            </span>
          </div>

          <p className="product-detail__short-description">{product.short_description}</p>

          <div className="product-detail__pricing">
            {hasDiscount && (
              <span className="product-detail__original-price">
                {formatCurrency(product.price!, product.currency)}
              </span>
            )}
            <span className="product-detail__current-price">
              {formatCurrency(displayPrice!, product.currency)}
            </span>
          </div>

          {product.requires_shipping && (
            <div className="product-detail__shipping">
              <strong>Shipping:</strong>{' '}
              {product.shipping_cost === 0 ? (
                <span className="product-detail__free-shipping">Free Shipping</span>
              ) : (
                formatCurrency(product.shipping_cost!, product.currency)
              )}
              {product.estimated_delivery_days && (
                <span> • Delivery in {product.estimated_delivery_days} days</span>
              )}
            </div>
          )}

          {product.stock_quantity !== null && (
            <div className="product-detail__stock">
              {product.stock_quantity > 0 ? (
                <>
                  <span className="product-detail__in-stock">In Stock</span>
                  {product.stock_quantity <= (product.low_stock_threshold || 10) && (
                    <span className="product-detail__low-stock">
                      {' '}
                      • Only {product.stock_quantity} left!
                    </span>
                  )}
                </>
              ) : (
                <span className="product-detail__out-of-stock">Out of Stock</span>
              )}
            </div>
          )}

          <div className="product-detail__quantity">
            <label>Quantity:</label>
            <div className="product-detail__quantity-control">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= (product.min_purchase_quantity || 1)}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={
                  quantity >= (product.max_purchase_quantity || product.stock_quantity || 999)
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="product-detail__total">
            <strong>Total:</strong> {formatCurrency(totalPrice, product.currency)}
          </div>

          <button
            className="product-detail__purchase-button"
            onClick={handlePurchase}
            disabled={!product.is_active || (product.stock_quantity !== null && product.stock_quantity === 0)}
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Purchase Now'}
          </button>

          {product.tags && product.tags.length > 0 && (
            <div className="product-detail__tags">
              {product.tags.map((tag, index) => (
                <span key={index} className="product-detail__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="product-detail__details">
        <div className="product-detail__section">
          <h2>Description</h2>
          <div
            className="product-detail__description"
            dangerouslySetInnerHTML={{ __html: product.long_description }}
          />
        </div>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="product-detail__section">
            <h2>Specifications</h2>
            <table className="product-detail__specs-table">
              <tbody>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="product-detail__spec-key">{key}</td>
                    <td className="product-detail__spec-value">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="product-detail__reviews">
        <ProductReviews productId={product.product_id} />
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <PurchaseModal
          product={product}
          quantity={quantity}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={() => {
            setShowPurchaseModal(false);
            if (onPurchaseComplete) {
              onPurchaseComplete();
            }
          }}
        />
      )}

      <style jsx>{`
        .product-detail {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .product-detail__loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .product-detail__container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        .product-detail__gallery {
          position: sticky;
          top: 24px;
          height: fit-content;
        }

        .product-detail__main-image {
          position: relative;
          width: 100%;
          padding-top: 100%;
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .product-detail__image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-detail__badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          z-index: 1;
        }

        .product-detail__badge--featured {
          background: #4CAF50;
          color: white;
        }

        .product-detail__badge--discount {
          background: #FF5722;
          color: white;
          top: 56px;
        }

        .product-detail__thumbnails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 12px;
        }

        .product-detail__thumbnail {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .product-detail__thumbnail:hover {
          border-color: #1976D2;
        }

        .product-detail__thumbnail--active {
          border-color: #1976D2;
        }

        .product-detail__video {
          margin-top: 16px;
        }

        .product-detail__video video {
          width: 100%;
          border-radius: 8px;
        }

        .product-detail__info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-detail__title {
          font-size: 32px;
          margin: 0;
          color: #333;
        }

        .product-detail__partner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .product-detail__partner-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .product-detail__partner-name {
          font-weight: 600;
          color: #333;
        }

        .product-detail__partner-rating {
          font-size: 14px;
          color: #666;
        }

        .product-detail__rating {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-detail__rating-stars {
          color: #FFA000;
          font-size: 18px;
        }

        .product-detail__rating-count,
        .product-detail__sales-count {
          color: #666;
          font-size: 14px;
        }

        .product-detail__short-description {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
        }

        .product-detail__pricing {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .product-detail__original-price {
          font-size: 20px;
          color: #999;
          text-decoration: line-through;
        }

        .product-detail__current-price {
          font-size: 36px;
          font-weight: 700;
          color: #1976D2;
        }

        .product-detail__shipping,
        .product-detail__stock {
          font-size: 14px;
          color: #666;
        }

        .product-detail__free-shipping {
          color: #4CAF50;
          font-weight: 600;
        }

        .product-detail__in-stock {
          color: #4CAF50;
          font-weight: 600;
        }

        .product-detail__low-stock {
          color: #FF5722;
          font-weight: 600;
        }

        .product-detail__out-of-stock {
          color: #F44336;
          font-weight: 600;
        }

        .product-detail__quantity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-detail__quantity-control {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .product-detail__quantity-control button {
          width: 40px;
          height: 40px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 20px;
          transition: background 0.2s;
        }

        .product-detail__quantity-control button:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .product-detail__quantity-control button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .product-detail__quantity-control span {
          min-width: 60px;
          text-align: center;
          font-weight: 600;
        }

        .product-detail__total {
          font-size: 20px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .product-detail__purchase-button {
          padding: 16px 32px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: #1976D2;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .product-detail__purchase-button:hover:not(:disabled) {
          background: #1565C0;
        }

        .product-detail__purchase-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .product-detail__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .product-detail__tag {
          padding: 6px 12px;
          background: #E3F2FD;
          color: #1976D2;
          border-radius: 16px;
          font-size: 12px;
        }

        .product-detail__details {
          margin-bottom: 48px;
        }

        .product-detail__section {
          margin-bottom: 32px;
        }

        .product-detail__section h2 {
          font-size: 24px;
          margin-bottom: 16px;
          color: #333;
        }

        .product-detail__description {
          line-height: 1.8;
          color: #666;
        }

        .product-detail__specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .product-detail__specs-table tr {
          border-bottom: 1px solid #eee;
        }

        .product-detail__spec-key,
        .product-detail__spec-value {
          padding: 12px;
        }

        .product-detail__spec-key {
          font-weight: 600;
          width: 30%;
          color: #666;
        }

        .product-detail__spec-value {
          color: #333;
        }

        @media (max-width: 768px) {
          .product-detail__container {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .product-detail__gallery {
            position: static;
          }

          .product-detail__title {
            font-size: 24px;
          }

          .product-detail__current-price {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
