'use client';

/**
 * ImageContext
 * ─────────────────────────────────────────────────────────────────
 * Shares the blob-URL of the most-recently uploaded satellite image
 * between the UploadPanel (producer) and ClassificationVisualization
 * (consumer).  Avoids prop-drilling across the page tree.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

interface ImageContextValue {
    uploadedImageUrl: string | null;
    setUploadedImageUrl: (url: string | null) => void;
}

const ImageContext = createContext<ImageContextValue>({
    uploadedImageUrl: null,
    setUploadedImageUrl: () => undefined,
});

export function ImageProvider({ children }: { children: ReactNode }) {
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    return (
        <ImageContext.Provider value={{ uploadedImageUrl, setUploadedImageUrl }}>
            {children}
        </ImageContext.Provider>
    );
}

export function useImageContext() {
    return useContext(ImageContext);
}
