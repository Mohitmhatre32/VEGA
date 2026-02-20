// ─── Classification API Client ────────────────────────────────────────────────
// Communicates with the FastAPI backend running on port 8000.
// Backend route: POST /classification/predict  (multipart/form-data, field "file")
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────────────────

/** Matches the JSON shape returned by POST /classification/predict */
export interface PredictionResult {
    filename: string;
    /** Top predicted class label, e.g. "Urban" */
    prediction: string;
    /** String like "87.43%" */
    confidence: string;
    /** Class name → probability (0-100) */
    breakdown: Record<string, number>;
}

// ── API call ───────────────────────────────────────────────────────────────────

/**
 * Upload a single image file to the backend and return the AI prediction.
 * Throws an Error with a descriptive message on non-200 responses.
 */
export async function predictImage(file: File): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/classification/predict`, {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type manually — fetch sets it with the correct boundary
    });

    if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
            const json = await res.json();
            if (json?.detail) detail = json.detail;
        } catch {
            // ignore parse error
        }
        throw new Error(detail);
    }

    return res.json() as Promise<PredictionResult>;
}
