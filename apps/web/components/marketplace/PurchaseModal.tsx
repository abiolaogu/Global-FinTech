/**
 * Purchase Modal Component
 * Handles product purchase flow with shipping and payment
 */

import React, { useState } from 'react';
import type { MarketplaceProduct, ShippingAddress, CustomerDetails } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { formatCurrency } from '../../utils/marketplace';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PurchaseModalProps {
  product: MarketplaceProduct;
  quantity: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  product,
  quantity,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'confirm' | 'processing' | 'success'>('details');
  const [error, setError] = useState<string | null>(null);

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    full_name: '',
    email: '',
    phone: '',
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const displayPrice = product.discount_price || product.price;
  const subtotal = (displayPrice || 0) * quantity;
  const shippingCost = product.shipping_cost || 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'details') {
      // Validate form
      if (!customerDetails.full_name || !customerDetails.email) {
        setError('Please fill in all required fields');
        return;
      }

      if (product.requires_shipping) {
        if (!shippingAddress.address_line_1 || !shippingAddress.city || !shippingAddress.country) {
          setError('Please provide complete shipping address');
          return;
        }
      }

      setError(null);
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      try {
        setStep('processing');
        setError(null);

        const purchaseDto = {
          quantity,
          customer_details: customerDetails,
          ...(product.requires_shipping && { shipping_address: shippingAddress }),
        };

        await marketplaceService.purchaseProduct(product.product_id, purchaseDto);

        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Purchase failed');
        setStep('confirm');
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 'confirm') {
      setStep('details');
    }
  };

  return (
    <div className="purchase-modal__overlay" onClick={onClose}>
      <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="purchase-modal__header">
          <h2>
            {step === 'details' && 'Purchase Details'}
            {step === 'confirm' && 'Confirm Purchase'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Purchase Successful!'}
          </h2>
          <button className="purchase-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="purchase-modal__content">
          {/* Product Summary */}
          <div className="purchase-modal__product-summary">
            <img
              src={product.thumbnail_url || product.images[0] || '/placeholder-product.png'}
              alt={product.name}
              className="purchase-modal__product-image"
            />
            <div>
              <h3>{product.name}</h3>
              <p>Quantity: {quantity}</p>
              <p className="purchase-modal__price">
                {formatCurrency(displayPrice!, product.currency)} × {quantity} = {formatCurrency(subtotal, product.currency)}
              </p>
            </div>
          </div>

          {error && (
            <div className="purchase-modal__error">
              {error}
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit}>
              {/* Customer Details */}
              <div className="purchase-modal__section">
                <h3>Customer Details</h3>
                <div className="purchase-modal__form-group">
                  <label htmlFor="full_name">Full Name *</label>
                  <input
                    id="full_name"
                    type="text"
                    value={customerDetails.full_name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="purchase-modal__form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    required
                  />
                </div>
                <div className="purchase-modal__form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              {product.requires_shipping && (
                <div className="purchase-modal__section">
                  <h3>Shipping Address</h3>
                  <div className="purchase-modal__form-group">
                    <label htmlFor="address_line_1">Address Line 1 *</label>
                    <input
                      id="address_line_1"
                      type="text"
                      value={shippingAddress.address_line_1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_1: e.target.value })}
                      required
                    />
                  </div>
                  <div className="purchase-modal__form-group">
                    <label htmlFor="address_line_2">Address Line 2</label>
                    <input
                      id="address_line_2"
                      type="text"
                      value={shippingAddress.address_line_2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_2: e.target.value })}
                    />
                  </div>
                  <div className="purchase-modal__form-row">
                    <div className="purchase-modal__form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        id="city"
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="purchase-modal__form-group">
                      <label htmlFor="state">State/Province</label>
                      <input
                        id="state"
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="purchase-modal__form-row">
                    <div className="purchase-modal__form-group">
                      <label htmlFor="postal_code">Postal Code *</label>
                      <input
                        id="postal_code"
                        type="text"
                        value={shippingAddress.postal_code}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="purchase-modal__form-group">
                      <label htmlFor="country">Country *</label>
                      <input
                        id="country"
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="purchase-modal__button purchase-modal__button--primary">
                Continue to Confirmation
              </button>
            </form>
          )}

          {step === 'confirm' && (
            <div>
              <div className="purchase-modal__section">
                <h3>Order Summary</h3>
                <div className="purchase-modal__summary">
                  <div className="purchase-modal__summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, product.currency)}</span>
                  </div>
                  {product.requires_shipping && (
                    <div className="purchase-modal__summary-row">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost, product.currency)}
                      </span>
                    </div>
                  )}
                  <div className="purchase-modal__summary-row purchase-modal__summary-total">
                    <strong>Total</strong>
                    <strong>{formatCurrency(total, product.currency)}</strong>
                  </div>
                </div>

                <div className="purchase-modal__confirm-details">
                  <h4>Customer Details</h4>
                  <p>{customerDetails.full_name}</p>
                  <p>{customerDetails.email}</p>
                  {customerDetails.phone && <p>{customerDetails.phone}</p>}

                  {product.requires_shipping && (
                    <>
                      <h4>Shipping Address</h4>
                      <p>{shippingAddress.address_line_1}</p>
                      {shippingAddress.address_line_2 && <p>{shippingAddress.address_line_2}</p>}
                      <p>
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                      </p>
                      <p>{shippingAddress.country}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="purchase-modal__actions">
                <button
                  type="button"
                  className="purchase-modal__button purchase-modal__button--secondary"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="purchase-modal__button purchase-modal__button--primary"
                  onClick={handleSubmit}
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="purchase-modal__processing">
              <LoadingSpinner size="large" />
              <p>Processing your purchase...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="purchase-modal__success">
              <div className="purchase-modal__success-icon">✓</div>
              <h3>Purchase Successful!</h3>
              <p>Your order has been confirmed. You will receive a confirmation email shortly.</p>
            </div>
          )}
        </div>

        <style jsx>{`
          .purchase-modal__overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 24px;
          }

          .purchase-modal {
            background: white;
            border-radius: 8px;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .purchase-modal__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid #eee;
          }

          .purchase-modal__header h2 {
            margin: 0;
            font-size: 24px;
            color: #333;
          }

          .purchase-modal__close {
            background: none;
            border: none;
            font-size: 32px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 32px;
            height: 32px;
            line-height: 1;
          }

          .purchase-modal__close:hover {
            color: #333;
          }

          .purchase-modal__content {
            padding: 24px;
          }

          .purchase-modal__product-summary {
            display: flex;
            gap: 16px;
            padding: 16px;
            background: #f5f5f5;
            border-radius: 8px;
            margin-bottom: 24px;
          }

          .purchase-modal__product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
          }

          .purchase-modal__product-summary h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #333;
          }

          .purchase-modal__product-summary p {
            margin: 4px 0;
            font-size: 14px;
            color: #666;
          }

          .purchase-modal__price {
            font-weight: 600;
            color: #1976D2 !important;
          }

          .purchase-modal__error {
            padding: 12px;
            background: #FFEBEE;
            color: #C62828;
            border-radius: 4px;
            margin-bottom: 16px;
          }

          .purchase-modal__section {
            margin-bottom: 24px;
          }

          .purchase-modal__section h3,
          .purchase-modal__section h4 {
            margin: 0 0 16px 0;
            color: #333;
          }

          .purchase-modal__form-group {
            margin-bottom: 16px;
          }

          .purchase-modal__form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
          }

          .purchase-modal__form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }

          .purchase-modal__form-group input:focus {
            outline: none;
            border-color: #1976D2;
          }

          .purchase-modal__form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .purchase-modal__button {
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: background 0.2s;
          }

          .purchase-modal__button--primary {
            background: #1976D2;
            color: white;
            width: 100%;
          }

          .purchase-modal__button--primary:hover {
            background: #1565C0;
          }

          .purchase-modal__button--secondary {
            background: #f5f5f5;
            color: #333;
          }

          .purchase-modal__button--secondary:hover {
            background: #e0e0e0;
          }

          .purchase-modal__actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .purchase-modal__summary {
            background: #f5f5f5;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
          }

          .purchase-modal__summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 16px;
          }

          .purchase-modal__summary-total {
            border-top: 2px solid #ddd;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
            color: #1976D2;
          }

          .purchase-modal__confirm-details h4 {
            font-size: 14px;
            margin: 16px 0 8px 0;
            color: #666;
            text-transform: uppercase;
          }

          .purchase-modal__confirm-details p {
            margin: 4px 0;
            color: #333;
          }

          .purchase-modal__processing,
          .purchase-modal__success {
            text-align: center;
            padding: 48px 24px;
          }

          .purchase-modal__processing p {
            margin-top: 24px;
            font-size: 16px;
            color: #666;
          }

          .purchase-modal__success-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #4CAF50;
            color: white;
            font-size: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }

          .purchase-modal__success h3 {
            margin: 0 0 12px 0;
            font-size: 24px;
            color: #333;
          }

          .purchase-modal__success p {
            color: #666;
            font-size: 16px;
          }

          @media (max-width: 768px) {
            .purchase-modal__form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PurchaseModal;
