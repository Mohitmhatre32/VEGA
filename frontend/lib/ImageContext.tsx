'use client';

/**
 * ImageContext
 * -----------
 * Provides a shared slot for the latest uploaded image (as an object-URL string)
 * so that any component in the dashboard can read it without prop-drilling.
 *
 * Usage:
 *   — Writer  : const { setUploadedImageUrl } = useImageContext();
 *   — Reader  : const { uploadedImageUrl }    = useImageContext();
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ImageContextValue {
    uploadedImageUrl: string | null;
    setUploadedImageUrl: (url: string | null) => void;
}

const ImageContext = createContext<ImageContextValue>({
    uploadedImageUrl: null,
    setUploadedImageUrl: () => { },
});

export function ImageProvider({ children }: { children: ReactNode }) {
    const [uploadedImageUrl, setUrl] = useState<string | null>(null);

    const setUploadedImageUrl = useCallback((url: string | null) => {
        // Revoke previous object-URL to avoid memory leaks
        setUrl((prev) => {
            if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
            return url;
        });
    }, []);

    return (
        <ImageContext.Provider value={{ uploadedImageUrl, setUploadedImageUrl }}>
            {children}
        </ImageContext.Provider>
    );
}

export function useImageContext() {
    return useContext(ImageContext);
}
