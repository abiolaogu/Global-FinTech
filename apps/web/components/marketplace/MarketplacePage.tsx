import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { MarketplaceProduct } from '../../types/marketplace';
import { marketplaceService } from '../../services/marketplace.service';
import { CategoryGrid } from './CategoryGrid';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { GlassCard } from '../ui/GlassCard';
import { motion } from 'framer-motion';

export const MarketplacePage: React.FC = () => {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<MarketplaceProduct[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Simple in-memory cache to prevent redundant fetches
  const cache = React.useRef<{ featured?: MarketplaceProduct[], trending?: MarketplaceProduct[] }>({});

  const handleProductClick = (product: MarketplaceProduct) => {
    // Navigate to product detail page
    router.push(`/marketplace/product/${product.slug}`);
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    // Check cache first
    if (cache.current.featured && cache.current.trending) {
      setFeaturedProducts(cache.current.featured);
      setTrendingProducts(cache.current.trending);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [featured, trending] = await Promise.all([
        marketplaceService.getFeaturedProducts(undefined, 8),
        marketplaceService.getTrendingProducts(undefined, 8),
      ]);

      // Update cache
      cache.current = { featured, trending };

      setFeaturedProducts(featured);
      setTrendingProducts(trending);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAIInsights = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_ADVISOR_URL || 'http://localhost:8000'}/advise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user-123',
          query: 'Provide financial advice based on my recent activity.',
          provider: 'mock'
        }),
      });
      const data = await response.json();
      alert(`AI Advisor (${data.source}): ${data.insight}`);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      alert('Failed to connect to AI Advisor. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-fintech-dark">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fintech-dark text-white overflow-hidden relative">
      {/* Background Glow Effects - Optimized with will-change */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-fintech-primary opacity-20 blur-[120px] rounded-full will-change-transform" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fintech-secondary opacity-20 blur-[120px] rounded-full will-change-transform" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center z-10 relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-fintech-accent to-fintech-primary will-change-transform"
          >
            The Future of Finance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto will-change-transform"
          >
            Discover a world of premium products and services.
            Powered by global innovation and secured by advanced AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex max-w-2xl mx-auto gap-4 will-change-transform"
          >
            <input
              type="text"
              placeholder="Search for anything..."
              className="flex-1 px-6 py-4 bg-glass-white backdrop-blur-md border border-glass-stroke rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-fintech-accent transition-colors"
            />
            <button className="px-8 py-4 bg-fintech-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-glow transition-all">
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* AI Advisor Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-fintech-primary/20 to-fintech-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-2xl font-bold text-white">Global AI Financial Advisor</h2>
                </div>
                <p className="text-gray-300">Get personalized spending insights and investment advice powered by our advanced AI engine.</p>
              </div>
              <button
                onClick={handleGetAIInsights}
                className="px-8 py-3 bg-white text-fintech-dark font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                Get Insights
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-white">Explore Categories</h2>
          <CategoryGrid showFeaturedOnly={true} />
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-6 bg-glass-dark/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Featured Products</h2>
              <a href="/marketplace/featured" className="text-fintech-accent hover:text-white transition-colors">
                View All →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <GlassCard key={product.product_id} className="p-0 overflow-hidden group cursor-pointer">
                  <div className="h-48 bg-gray-800 relative">
                    {/* Placeholder for product image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                      Product Image
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-fintech-accent transition-colors">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.short_description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">${product.price}</span>
                      <button className="p-2 bg-fintech-primary/20 text-fintech-primary rounded-lg hover:bg-fintech-primary hover:text-white transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MarketplacePage;
