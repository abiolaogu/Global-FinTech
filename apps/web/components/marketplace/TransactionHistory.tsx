/**
 * Transaction History Component
 * Displays user's marketplace transaction history
 */

import React, { useState, useEffect } from 'react';
import type { PartnerTransaction, PaginatedResponse } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { formatCurrency } from '../../utils/marketplace';

interface TransactionHistoryProps {
  onTransactionClick?: (transaction: PartnerTransaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onTransactionClick }) => {
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
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
    loadTransactions();
  }, [page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await marketplaceService.getUserTransactions(page, 20);
      setTransactions(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: '#4CAF50',
      pending: '#FF9800',
      processing: '#2196F3',
      failed: '#F44336',
      cancelled: '#757575',
      refunded: '#9C27B0',
      disputed: '#FF5722',
    };
    return colors[status] || '#999';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="transaction-history__loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadTransactions}
      />
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-history__empty">
        <h3>No transactions yet</h3>
        <p>Your marketplace purchases will appear here.</p>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="transaction-history__header">
        <h2>Transaction History</h2>
        <p className="transaction-history__count">
          {pagination.total} {pagination.total === 1 ? 'transaction' : 'transactions'}
        </p>
      </div>

      <div className="transaction-history__list">
        {transactions.map((transaction) => (
          <div
            key={transaction.transaction_id}
            className="transaction-card"
            onClick={() => onTransactionClick && onTransactionClick(transaction)}
            role={onTransactionClick ? 'button' : undefined}
            tabIndex={onTransactionClick ? 0 : undefined}
          >
            <div className="transaction-card__header">
              <div className="transaction-card__reference">
                <strong>{transaction.reference}</strong>
                <span className="transaction-card__date">
                  {formatDate(transaction.created_at)}
                </span>
              </div>
              <div
                className="transaction-card__status"
                style={{ color: getStatusColor(transaction.status) }}
              >
                {transaction.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {transaction.product && (
              <div className="transaction-card__product">
                <img
                  src={
                    transaction.product.thumbnail_url ||
                    transaction.product.images[0] ||
                    '/placeholder-product.png'
                  }
                  alt={transaction.product.name}
                  className="transaction-card__product-image"
                />
                <div className="transaction-card__product-details">
                  <h3>{transaction.product.name}</h3>
                  {transaction.partner && (
                    <p className="transaction-card__partner">
                      by {transaction.partner.name}
                    </p>
                  )}
                  <p className="transaction-card__quantity">
                    Quantity: {transaction.quantity}
                  </p>
                </div>
              </div>
            )}

            <div className="transaction-card__amounts">
              <div className="transaction-card__amount-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(transaction.subtotal, transaction.currency)}</span>
              </div>
              {transaction.shipping_cost > 0 && (
                <div className="transaction-card__amount-row">
                  <span>Shipping:</span>
                  <span>{formatCurrency(transaction.shipping_cost, transaction.currency)}</span>
                </div>
              )}
              <div className="transaction-card__amount-row transaction-card__total">
                <strong>Total:</strong>
                <strong>{formatCurrency(transaction.total_amount, transaction.currency)}</strong>
              </div>
            </div>

            {transaction.tracking_number && (
              <div className="transaction-card__tracking">
                <strong>Tracking:</strong> {transaction.tracking_number}
              </div>
            )}

            {transaction.fulfillment_status && transaction.fulfillment_status !== 'pending' && (
              <div className="transaction-card__fulfillment">
                <strong>Fulfillment:</strong>{' '}
                {transaction.fulfillment_status.replace('_', ' ')}
              </div>
            )}

            {transaction.delivered_at && (
              <div className="transaction-card__delivered">
                Delivered on {formatDate(transaction.delivered_at)}
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="transaction-history__pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="transaction-history__page-button"
          >
            Previous
          </button>
          <span className="transaction-history__page-info">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            className="transaction-history__page-button"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .transaction-history {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .transaction-history__loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .transaction-history__empty {
          text-align: center;
          padding: 64px 24px;
          color: #666;
        }

        .transaction-history__empty h3 {
          font-size: 24px;
          margin-bottom: 12px;
          color: #333;
        }

        .transaction-history__header {
          margin-bottom: 24px;
        }

        .transaction-history__header h2 {
          font-size: 28px;
          margin: 0 0 8px 0;
          color: #333;
        }

        .transaction-history__count {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .transaction-history__list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .transaction-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .transaction-card[role='button'] {
          cursor: pointer;
        }

        .transaction-card[role='button']:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #1976D2;
        }

        .transaction-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .transaction-card__reference {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .transaction-card__reference strong {
          font-size: 16px;
          color: #333;
        }

        .transaction-card__date {
          font-size: 14px;
          color: #666;
        }

        .transaction-card__status {
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .transaction-card__product {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .transaction-card__product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }

        .transaction-card__product-details h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #333;
        }

        .transaction-card__product-details p {
          margin: 4px 0;
          font-size: 14px;
          color: #666;
        }

        .transaction-card__partner {
          color: #1976D2 !important;
        }

        .transaction-card__amounts {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .transaction-card__amount-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #666;
        }

        .transaction-card__total {
          border-top: 1px solid #e0e0e0;
          padding-top: 8px;
          margin-top: 8px;
          font-size: 16px;
          color: #333 !important;
        }

        .transaction-card__tracking,
        .transaction-card__fulfillment,
        .transaction-card__delivered {
          font-size: 14px;
          color: #666;
          margin-top: 8px;
        }

        .transaction-card__delivered {
          color: #4CAF50;
        }

        .transaction-history__pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 24px 0;
        }

        .transaction-history__page-button {
          padding: 10px 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .transaction-history__page-button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #1976D2;
          color: #1976D2;
        }

        .transaction-history__page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .transaction-history__page-info {
          color: #666;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .transaction-history {
            padding: 16px;
          }

          .transaction-card__header {
            flex-direction: column;
            gap: 12px;
          }

          .transaction-card__product {
            flex-direction: column;
          }

          .transaction-card__product-image {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;
