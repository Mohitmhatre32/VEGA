'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MapAnalysisResult, SinglePrediction } from '@/lib/classificationApi';

interface ImageContextValue {
    uploadedImageUrl: string | null;
    setUploadedImageUrl: (url: string | null) => void;
    mapAnalysis: MapAnalysisResult | null;
    setMapAnalysis: (data: MapAnalysisResult | null) => void;
    singleResult: SinglePrediction | null;
    setSingleResult: (data: SinglePrediction | null) => void;
}

const ImageContext = createContext<ImageContextValue | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [mapAnalysis, setMapAnalysis] = useState<MapAnalysisResult | null>(null);
    const [singleResult, setSingleResult] = useState<SinglePrediction | null>(null);

    return (
        <ImageContext.Provider value={{ 
            uploadedImageUrl, setUploadedImageUrl, 
            mapAnalysis, setMapAnalysis,
            singleResult, setSingleResult
        }}>
            {children}
        </ImageContext.Provider>
    );
}

export function useImageContext() {
    const context = useContext(ImageContext);
    if (!context) throw new Error('useImageContext must be used within ImageProvider');
    return context;
}