/**
 * Marketplace Page Component
 * Main marketplace landing page with featured products and categories
 */

import React, { useState, useEffect } from 'react';
import type { MarketplaceProduct } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { CategoryGrid } from './CategoryGrid';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const MarketplacePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<MarketplaceProduct[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);

      const [featured, trending] = await Promise.all([
        marketplaceService.getFeaturedProducts(undefined, 8),
        marketplaceService.getTrendingProducts(undefined, 8),
      ]);

      setFeaturedProducts(featured);
      setTrendingProducts(trending);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: MarketplaceProduct) => {
    // Navigate to product detail page
    // In a real Next.js app, you would use router.push()
    console.log('Navigate to product:', product.slug);
  };

  const handleCategoryClick = (category: any) => {
    // Navigate to category page
    console.log('Navigate to category:', category.slug);
  };

  if (loading) {
    return (
      <div className="marketplace-page__loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      {/* Hero Section */}
      <section className="marketplace-page__hero">
        <div className="marketplace-page__hero-content">
          <h1>Global-FinTech Marketplace</h1>
          <p>
            Discover amazing products and services from trusted partners around the world.
            Shop, book, subscribe, and more - all in one place.
          </p>
          <div className="marketplace-page__hero-search">
            <input
              type="text"
              placeholder="Search products, services, and partners..."
              className="marketplace-page__search-input"
            />
            <button className="marketplace-page__search-button">Search</button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="marketplace-page__section">
        <CategoryGrid
          onCategoryClick={handleCategoryClick}
          showFeaturedOnly={true}
        />
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="marketplace-page__section marketplace-page__section--gray">
          <div className="marketplace-page__section-container">
            <div className="marketplace-page__section-header">
              <h2>Featured Products</h2>
              <a href="/marketplace/featured" className="marketplace-page__see-all">
                See All →
              </a>
            </div>
            <div className="marketplace-page__products-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="marketplace-page__section">
          <div className="marketplace-page__section-container">
            <div className="marketplace-page__section-header">
              <h2>Trending Now</h2>
              <a href="/marketplace/trending" className="marketplace-page__see-all">
                See All →
              </a>
            </div>
            <div className="marketplace-page__products-grid">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="marketplace-page__section marketplace-page__section--benefits">
        <div className="marketplace-page__section-container">
          <h2>Why Shop on Global-FinTech Marketplace?</h2>
          <div className="marketplace-page__benefits-grid">
            <div className="marketplace-page__benefit">
              <div className="marketplace-page__benefit-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>All transactions are protected with bank-level security</p>
            </div>
            <div className="marketplace-page__benefit">
              <div className="marketplace-page__benefit-icon">✓</div>
              <h3>Verified Partners</h3>
              <p>Only trusted and verified partners on our platform</p>
            </div>
            <div className="marketplace-page__benefit">
              <div className="marketplace-page__benefit-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>Products and services available in 60+ countries</p>
            </div>
            <div className="marketplace-page__benefit">
              <div className="marketplace-page__benefit-icon">💰</div>
              <h3>Wallet Integration</h3>
              <p>Pay seamlessly using your Global-FinTech wallet</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .marketplace-page {
          min-height: 100vh;
          background: white;
        }

        .marketplace-page__loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .marketplace-page__hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 24px;
          text-align: center;
        }

        .marketplace-page__hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .marketplace-page__hero h1 {
          font-size: 48px;
          margin: 0 0 20px 0;
          font-weight: 700;
        }

        .marketplace-page__hero p {
          font-size: 20px;
          margin: 0 0 40px 0;
          opacity: 0.95;
          line-height: 1.6;
        }

        .marketplace-page__hero-search {
          display: flex;
          max-width: 600px;
          margin: 0 auto;
          gap: 12px;
        }

        .marketplace-page__search-input {
          flex: 1;
          padding: 16px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
        }

        .marketplace-page__search-button {
          padding: 16px 32px;
          background: #1976D2;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .marketplace-page__search-button:hover {
          background: #1565C0;
        }

        .marketplace-page__section {
          padding: 48px 0;
        }

        .marketplace-page__section--gray {
          background: #f9f9f9;
        }

        .marketplace-page__section--benefits {
          background: #f5f5f5;
        }

        .marketplace-page__section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .marketplace-page__section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .marketplace-page__section-header h2 {
          font-size: 32px;
          margin: 0;
          color: #333;
        }

        .marketplace-page__see-all {
          color: #1976D2;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .marketplace-page__see-all:hover {
          color: #1565C0;
          text-decoration: underline;
        }

        .marketplace-page__products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .marketplace-page__section--benefits h2 {
          text-align: center;
          margin-bottom: 48px;
        }

        .marketplace-page__benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
        }

        .marketplace-page__benefit {
          text-align: center;
          padding: 32px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .marketplace-page__benefit-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .marketplace-page__benefit h3 {
          font-size: 20px;
          margin: 0 0 12px 0;
          color: #333;
        }

        .marketplace-page__benefit p {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .marketplace-page__hero {
            padding: 48px 16px;
          }

          .marketplace-page__hero h1 {
            font-size: 32px;
          }

          .marketplace-page__hero p {
            font-size: 16px;
          }

          .marketplace-page__hero-search {
            flex-direction: column;
          }

          .marketplace-page__section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .marketplace-page__products-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }

          .marketplace-page__benefits-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .marketplace-page__benefit {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplacePage;
