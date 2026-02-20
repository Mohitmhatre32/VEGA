'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DashboardLoader } from '@/components/satellite/DashboardLoader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);

    const handleComplete = useCallback(() => setLoading(false), []);

    return (
        <>
            <AnimatePresence mode="wait">
                {loading && <DashboardLoader key="loader" onComplete={handleComplete} />}
            </AnimatePresence>
            {children}
        </>
    );
}
