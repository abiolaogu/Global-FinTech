import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hoverEffect = true
}) => {
    return (
        <div
            className={`
        bg-glass-white 
        backdrop-blur-md 
        border border-glass-stroke 
        rounded-2xl 
        shadow-glass 
        p-6 
        transition-all 
        duration-300 
        ${hoverEffect ? 'hover:bg-opacity-20 hover:scale-[1.02] hover:shadow-glow' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
