import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { useRouter } from 'next/router';

// Mock Data
const MOCK_TRANSACTIONS = [
    { id: '1', title: 'Apple Store', date: 'Today, 10:30 AM', amount: -45.20, type: 'debit', category: 'Shopping', icon: '🛍️' },
    { id: '2', title: 'Starbucks', date: 'Yesterday, 08:15 AM', amount: -4.50, type: 'debit', category: 'Food', icon: '☕' },
    { id: '3', title: 'Salary Deposit', date: 'Nov 28, 09:00 AM', amount: 3500.00, type: 'credit', category: 'Income', icon: '💰' },
    { id: '4', title: 'Netflix Subscription', date: 'Nov 25, 10:00 AM', amount: -15.99, type: 'debit', category: 'Entertainment', icon: '🎬' },
    { id: '5', title: 'Uber Ride', date: 'Nov 24, 08:30 PM', amount: -24.50, type: 'debit', category: 'Transport', icon: '🚗' },
];

export const TransactionHistoryPage: React.FC = () => {
    const router = useRouter();
    const [filter, setFilter] = useState('all');

    const filteredTransactions = MOCK_TRANSACTIONS.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    return (
        <div className="min-h-screen bg-fintech-dark text-white relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-fintech-secondary opacity-10 blur-[150px] rounded-full will-change-transform" />
            </div>

            <div className="max-w-4xl mx-auto px-6 py-32 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Transaction History</h1>
                        <p className="text-gray-400">Track your spending and income</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-glass-white border border-glass-stroke rounded-lg hover:bg-white/10 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {['all', 'credit', 'debit'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-full capitalize transition-all ${filter === f
                                    ? 'bg-fintech-primary text-white shadow-glow'
                                    : 'bg-glass-white text-gray-400 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Transaction List */}
                <div className="space-y-4">
                    {filteredTransactions.map((t, index) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-glass-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {t.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{t.title}</h3>
                                        <p className="text-sm text-gray-400">{t.date} • {t.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-bold ${t.type === 'credit' ? 'text-fintech-success' : 'text-white'}`}>
                                        {t.type === 'credit' ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                                    </span>
                                    <p className="text-xs text-gray-500">Completed</p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
