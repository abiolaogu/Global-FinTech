/**
 * Partner List Component
 * Displays marketplace partners with filtering
 */

import React, { useState, useEffect } from 'react';
import type { MarketplacePartner } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { formatRating, getCategoryIcon } from '../../utils/marketplace';

interface PartnerListProps {
  country?: string;
  category?: string;
  onPartnerClick?: (partner: MarketplacePartner) => void;
}

export const PartnerList: React.FC<PartnerListProps> = ({
  country,
  category,
  onPartnerClick,
}) => {
  const [partners, setPartners] = useState<MarketplacePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
  }, [country, category]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceService.getPartners(country, category);
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="partner-list__loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadPartners}
      />
    );
  }

  if (partners.length === 0) {
    return (
      <div className="partner-list__empty">
        <h3>No partners found</h3>
        <p>Check back later for new marketplace partners.</p>
      </div>
    );
  }

  return (
    <div className="partner-list">
      <div className="partner-list__header">
        <h2>Marketplace Partners</h2>
        <p className="partner-list__count">
          {partners.length} {partners.length === 1 ? 'partner' : 'partners'}
        </p>
      </div>

      <div className="partner-list__grid">
        {partners.map((partner) => (
          <div
            key={partner.partner_id}
            className="partner-card"
            onClick={() => onPartnerClick && onPartnerClick(partner)}
            role={onPartnerClick ? 'button' : undefined}
            tabIndex={onPartnerClick ? 0 : undefined}
          >
            {partner.is_featured && (
              <div className="partner-card__badge">Featured</div>
            )}

            <div className="partner-card__header">
              <img
                src={partner.logo_url || '/placeholder-partner.png'}
                alt={partner.name}
                className="partner-card__logo"
              />
            </div>

            {partner.banner_url && (
              <div className="partner-card__banner">
                <img
                  src={partner.banner_url}
                  alt={`${partner.name} banner`}
                  className="partner-card__banner-img"
                />
              </div>
            )}

            <div className="partner-card__content">
              <div className="partner-card__category">
                {getCategoryIcon(partner.category)} {partner.category.replace('_', ' ')}
              </div>

              <h3 className="partner-card__name">{partner.name}</h3>

              <p className="partner-card__description">{partner.description}</p>

              <div className="partner-card__rating">
                <span className="partner-card__rating-stars">
                  {formatRating(partner.rating)}
                </span>
                <span className="partner-card__rating-count">
                  ({partner.review_count} reviews)
                </span>
              </div>

              <div className="partner-card__stats">
                <div className="partner-card__stat">
                  <strong>{partner.total_sales.toLocaleString()}</strong>
                  <span>Sales</span>
                </div>
                <div className="partner-card__stat">
                  <strong>{partner.supported_currencies.length}</strong>
                  <span>Currencies</span>
                </div>
                <div className="partner-card__stat">
                  <strong>{partner.countries_available.length}</strong>
                  <span>Countries</span>
                </div>
              </div>

              {partner.countries_available.length > 0 && (
                <div className="partner-card__countries">
                  Available in: {partner.countries_available.slice(0, 3).join(', ')}
                  {partner.countries_available.length > 3 && ` +${partner.countries_available.length - 3} more`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .partner-list {
          padding: 24px;
        }

        .partner-list__loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .partner-list__empty {
          text-align: center;
          padding: 64px 24px;
          color: #666;
        }

        .partner-list__empty h3 {
          font-size: 24px;
          margin-bottom: 12px;
          color: #333;
        }

        .partner-list__header {
          margin-bottom: 24px;
        }

        .partner-list__header h2 {
          font-size: 28px;
          margin: 0 0 8px 0;
          color: #333;
        }

        .partner-list__count {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .partner-list__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .partner-card {
          position: relative;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .partner-card[role='button'] {
          cursor: pointer;
        }

        .partner-card[role='button']:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .partner-card__badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          background: #4CAF50;
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          z-index: 1;
        }

        .partner-card__header {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          background: #f5f5f5;
          min-height: 120px;
        }

        .partner-card__logo {
          max-width: 120px;
          max-height: 80px;
          object-fit: contain;
        }

        .partner-card__banner {
          width: 100%;
          height: 120px;
          overflow: hidden;
        }

        .partner-card__banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .partner-card__content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .partner-card__category {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .partner-card__name {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #333;
        }

        .partner-card__description {
          font-size: 14px;
          color: #666;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .partner-card__rating {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .partner-card__rating-stars {
          color: #FFA000;
          margin-right: 8px;
        }

        .partner-card__rating-count {
          color: #999;
          font-size: 12px;
        }

        .partner-card__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 12px;
        }

        .partner-card__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .partner-card__stat strong {
          font-size: 18px;
          color: #1976D2;
          margin-bottom: 4px;
        }

        .partner-card__stat span {
          font-size: 12px;
          color: #666;
        }

        .partner-card__countries {
          font-size: 12px;
          color: #666;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .partner-list {
            padding: 16px;
          }

          .partner-list__grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerList;
