#!/bin/bash

# Generate encryption key for development
echo "Generating secure encryption key..."
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env

    # Replace the placeholder encryption key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    else
        # Linux
        sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    fi

    echo "✅ .env file created with secure encryption key"
    echo ""
    echo "⚠️  IMPORTANT: Please configure your payment gateway API keys in .env"
    echo ""
    echo "Required payment gateways (choose at least one):"
    echo "  - PAYSTACK_SECRET_KEY (for Nigeria, Ghana, South Africa, Kenya)"
    echo "  - FLUTTERWAVE_SECRET_KEY (for multiple African countries)"
    echo "  - STRIPE_SECRET_KEY (for global payments)"
    echo ""
else
    echo "⚠️  .env file already exists. Skipping..."
fi

echo "Done!"
