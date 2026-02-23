'use client';

/**
 * ImageContext
 * ─────────────────────────────────────────────────────────────────
 * Shares the satellite image URL and the full map-analysis grid data
 * between UploadPanel (producer) and ClassificationVisualization (consumer).
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MapAnalysisResult } from '@/lib/classificationApi';

interface ImageContextValue {
    uploadedImageUrl: string | null;
    setUploadedImageUrl: (url: string | null) => void;
    mapAnalysis: MapAnalysisResult | null;
    setMapAnalysis: (data: MapAnalysisResult | null) => void;
}

const ImageContext = createContext<ImageContextValue>({
    uploadedImageUrl: null,
    setUploadedImageUrl: () => undefined,
    mapAnalysis: null,
    setMapAnalysis: () => undefined,
});

export function ImageProvider({ children }: { children: ReactNode }) {
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [mapAnalysis, setMapAnalysis] = useState<MapAnalysisResult | null>(null);
    return (
        <ImageContext.Provider value={{ uploadedImageUrl, setUploadedImageUrl, mapAnalysis, setMapAnalysis }}>
            {children}
        </ImageContext.Provider>
    );
}

export function useImageContext() {
    return useContext(ImageContext);
}
