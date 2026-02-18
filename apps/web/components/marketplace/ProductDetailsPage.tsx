import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { marketplaceService } from '../../services/marketplace.service';
import type { MarketplaceProduct } from '../../types/marketplace';

export const ProductDetailsPage: React.FC = () => {
    const router = useRouter();
    const { slug } = router.query;
    const [product, setProduct] = useState<MarketplaceProduct | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            loadProduct(slug as string);
        }
    }, [slug]);

    const loadProduct = async (productSlug: string) => {
        try {
            setLoading(true);
            // In a real app, we'd fetch by slug. For now, we'll fetch all and find it, or mock it.
            // const p = await marketplaceService.getProductBySlug(productSlug);
            // Mocking for demo purposes if API doesn't support slug fetch yet
            const products = await marketplaceService.getFeaturedProducts();
            const found = products.find(p => p.slug === productSlug) || products[0];
            setProduct(found);
        } catch (error) {
            console.error('Failed to load product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !product) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-fintech-dark">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-fintech-dark text-white relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-fintech-primary opacity-10 blur-[150px] rounded-full will-change-transform" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-fintech-accent opacity-10 blur-[150px] rounded-full will-change-transform" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <button
                    onClick={() => router.back()}
                    className="mb-8 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    ← Back to Marketplace
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Visuals */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <GlassCard className="h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border-fintech-primary/20">
                            <div className="text-center">
                                <span className="text-6xl mb-4 block">📦</span>
                                <p className="text-gray-500">Product Visualization</p>
                            </div>
                        </GlassCard>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <GlassCard key={i} className="h-24 flex items-center justify-center cursor-pointer hover:border-fintech-accent transition-colors">
                                    <span className="text-2xl">📷</span>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 rounded-full bg-fintech-primary/20 text-fintech-primary text-sm font-medium">
                                {product.product_type}
                            </span>
                            <span className="text-fintech-success flex items-center gap-1 text-sm">
                                ● In Stock
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            {product.long_description || product.short_description}
                        </p>

                        <div className="flex items-end gap-4 mb-8">
                            <span className="text-5xl font-bold text-white">${product.price}</span>
                            {product.discount_price && (
                                <span className="text-xl text-gray-500 line-through mb-2">${product.discount_price}</span>
                            )}
                        </div>

                        <div className="space-y-4 mb-8">
                            <GlassCard className="p-4 flex items-center justify-between">
                                <span className="text-gray-400">Provider</span>
                                <span className="font-medium">{product.partner_id}</span>
                            </GlassCard>
                            <GlassCard className="p-4 flex items-center justify-between">
                                <span className="text-gray-400">Category</span>
                                <span className="font-medium">{product.category_id}</span>
                            </GlassCard>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-fintech-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-glow transition-all transform hover:scale-[1.02]">
                                Buy Now
                            </button>
                            <button className="px-6 py-4 bg-glass-white border border-glass-stroke hover:bg-white/10 text-white font-bold rounded-xl transition-all">
                                Add to Cart
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
