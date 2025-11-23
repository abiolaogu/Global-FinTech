# Global-FinTech Web Application

This directory contains the Next.js-based web application for Global-FinTech's customer-facing and administrative interfaces.

## Marketplace Feature

The marketplace module provides a complete e-commerce solution for third-party product and service integration.

### Components

#### Product Components
- **ProductCard** - Displays product in card format with pricing, ratings, and badges
- **ProductList** - Paginated grid of products with filtering support
- **ProductDetail** - Full product details with image gallery, reviews, and purchase options
- **ProductReviews** - Customer reviews and ratings display
- **PurchaseModal** - Multi-step purchase flow with customer details and shipping

#### Partner Components
- **PartnerList** - Grid display of marketplace partners
- **CategoryGrid** - Browse products by category

#### Transaction Components
- **TransactionHistory** - User's marketplace purchase history

#### Common Components
- **LoadingSpinner** - Reusable loading indicator
- **ErrorMessage** - Error display with retry option
- **Pagination** - Paginated navigation controls

### Services

- **marketplaceService** - API client for all marketplace endpoints
  - Categories, partners, products
  - Purchase flow
  - Transaction management
  - Reviews

### Types

Complete TypeScript definitions for:
- Products, Partners, Categories
- Transactions, Reviews
- API responses and requests

### Utilities

Helper functions for:
- Currency formatting
- Rating display
- Date formatting
- Product validation
- HTML sanitization

## Usage

### Import Components

```typescript
import {
  MarketplacePage,
  ProductList,
  ProductDetail
} from '@/components/marketplace';
```

### API Configuration

Set the API base URL in environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Authentication

The marketplace service automatically includes JWT tokens from localStorage:

```typescript
// Token is retrieved from localStorage.getItem('auth_token')
```

## Integration with Backend

The frontend connects to the NestJS backend marketplace module:

- **Base URL**: `/api/marketplace`
- **Authentication**: JWT Bearer tokens
- **Response Format**: `{ success: boolean, data: T, message?: string }`

### Key Endpoints

- `GET /marketplace/categories` - List categories
- `GET /marketplace/partners` - List partners
- `GET /marketplace/products` - List products (with filters)
- `GET /marketplace/products/:id` - Get product details
- `POST /marketplace/products/:id/purchase` - Purchase product
- `GET /marketplace/transactions` - User transactions
- `POST /marketplace/transactions/:id/review` - Add review

## Features

### Product Browsing
- Category-based navigation
- Advanced filtering (price, category, country, search)
- Featured and trending products
- Product ratings and reviews

### Purchase Flow
1. Select product and quantity
2. Enter customer details
3. Provide shipping address (if required)
4. Confirm order summary
5. Process payment via wallet
6. Receive confirmation

### Transaction Management
- View purchase history
- Track order status
- View shipping details
- Add product reviews

### Partner Integration
- Browse verified partners
- View partner details and ratings
- Filter by category and country
- See available products per partner

## Styling

Components use **CSS-in-JS** (styled-jsx) for scoped styling:

```tsx
<style jsx>{`
  .component {
    /* Styles here */
  }
`}</style>
```

### Responsive Design
- Mobile-first approach
- Breakpoint: 768px for tablet/mobile
- Grid layouts adapt to screen size

### Color Scheme
- Primary: `#1976D2` (Blue)
- Success: `#4CAF50` (Green)
- Warning: `#FF9800` (Orange)
- Error: `#F44336` (Red)
- Featured: `#4CAF50` (Green)
- Discount: `#FF5722` (Deep Orange)

## Development

### File Structure

```
apps/web/
├── components/
│   ├── marketplace/
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductReviews.tsx
│   │   ├── PurchaseModal.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── PartnerList.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── MarketplacePage.tsx
│   │   └── index.ts
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── Pagination.tsx
├── services/
│   └── marketplace.service.ts
├── types/
│   └── marketplace.ts
├── utils/
│   └── marketplace.ts
└── README.md
```

### Adding New Components

1. Create component in appropriate directory
2. Add TypeScript types
3. Import and use in parent components
4. Export from index file

### Best Practices

- Use TypeScript for type safety
- Handle loading and error states
- Implement proper accessibility (ARIA labels, keyboard navigation)
- Optimize images with lazy loading
- Use semantic HTML
- Follow responsive design patterns

## Testing

The marketplace components should be tested for:

- Product display and interaction
- Purchase flow completion
- Transaction history display
- Partner and category browsing
- Error handling
- Responsive behavior
- Accessibility compliance

## Future Enhancements

- Search functionality with autocomplete
- Advanced filtering UI
- Wishlist/favorites
- Product comparison
- Live chat with partners
- Social sharing
- Recommendation engine
- Multi-language support
- Currency selection
- Advanced analytics

## Support

For issues or questions:
- Backend API: See `/apps/api/src/modules/marketplace`
- Documentation: See `/docs/MARKETPLACE.md`
- Repository: https://github.com/your-org/Global-FinTech
