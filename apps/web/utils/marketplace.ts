/**
 * Marketplace Utility Functions
 * Helper functions for formatting and data manipulation
 */

/**
 * Format currency value with symbol
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency is not supported
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format rating as stars
 */
export const formatRating = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) {
    stars += '½';
  }
  stars += '☆'.repeat(emptyStars);

  return stars;
};

/**
 * Format large numbers with K, M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Calculate percentage discount
 */
export const calculateDiscount = (originalPrice: number, discountPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format date relative to now (e.g., "2 days ago")
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Get category icon
 */
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    financial_services: '💰',
    ecommerce: '🛒',
    travel: '✈️',
    utilities: '⚡',
    business_services: '💼',
    health: '🏥',
    education: '📚',
    lifestyle: '🎨',
    crypto: '₿',
    remittance: '💸',
  };
  return icons[category] || '📦';
};

/**
 * Get product type label
 */
export const getProductTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    physical: 'Physical Product',
    digital: 'Digital Product',
    service: 'Service',
    subscription: 'Subscription',
    utility: 'Utility',
    booking: 'Booking',
  };
  return labels[type] || type;
};

/**
 * Get integration type label
 */
export const getIntegrationTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    api: 'API Integration',
    redirect: 'Redirect to Partner',
    affiliate: 'Affiliate Link',
    white_label: 'White Label',
    embedded: 'Embedded Widget',
  };
  return labels[type] || type;
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Get transaction status color
 */
export const getTransactionStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    completed: '#4CAF50',
    pending: '#FF9800',
    processing: '#2196F3',
    failed: '#F44336',
    cancelled: '#757575',
    refunded: '#9C27B0',
    disputed: '#FF5722',
  };
  return colors[status] || '#999999';
};

/**
 * Get fulfillment status label
 */
export const getFulfillmentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  return labels[status] || status;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generate placeholder image URL
 */
export const getPlaceholderImage = (width: number = 400, height: number = 400, text?: string): string => {
  const displayText = text || `${width}x${height}`;
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(displayText)}`;
};

/**
 * Check if product is on sale
 */
export const isProductOnSale = (product: {
  discount_price?: number | null;
  price?: number | null;
  discount_start_date?: Date | null;
  discount_end_date?: Date | null;
}): boolean => {
  if (!product.discount_price || !product.price) return false;
  if (product.discount_price >= product.price) return false;

  const now = new Date();
  if (product.discount_start_date && new Date(product.discount_start_date) > now) return false;
  if (product.discount_end_date && new Date(product.discount_end_date) < now) return false;

  return true;
};

/**
 * Check if product is in stock
 */
export const isProductInStock = (product: {
  stock_quantity?: number | null;
}): boolean => {
  return product.stock_quantity === null || (typeof product.stock_quantity === 'number' && product.stock_quantity > 0);
};

/**
 * Get country flag emoji
 */
export const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

/**
 * Parse and sanitize HTML content
 */
export const sanitizeHTML = (html: string): string => {
  // Basic HTML sanitization - in production, use DOMPurify or similar
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
};
