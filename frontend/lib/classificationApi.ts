// ─── Classification API Client ────────────────────────────────────────────────
// Communicates with the FastAPI backend running on port 8000.
// Backend route: POST /classification/predict  (multipart/form-data, field "file")
//                POST /classification/predict-batch  (multipart/form-data, field "files" × N)
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

/**
 * Matches the JSON shape returned by POST /classification/predict-batch
 * { message, stats: { total_processed, distribution: { "Urban": 2, ... } } }
 */
export interface BatchPredictionResult {
    message: string;
    stats: {
        total_processed: number;
        /** Class name → count of images predicted as that class */
        distribution: Record<string, number>;
    };
}

// ── Single predict ─────────────────────────────────────────────────────────────

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
        } catch { /* ignore */ }
        throw new Error(detail);
    }

    return res.json() as Promise<PredictionResult>;
}

// ── Batch predict ──────────────────────────────────────────────────────────────

/**
 * Upload multiple image files in a single multipart request.
 * FastAPI expects each file under the same field key "files".
 * Returns aggregated stats: total count + per-class distribution.
 */
export async function predictBatch(files: File[]): Promise<BatchPredictionResult> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));   // same key, repeated

    const res = await fetch(`${API_BASE}/classification/predict-batch`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
            const json = await res.json();
            if (json?.detail) detail = json.detail;
        } catch { /* ignore */ }
        throw new Error(detail);
    }

    return res.json() as Promise<BatchPredictionResult>;
}

// ── Change Detection ───────────────────────────────────────────────────────────

/** Per-class row returned inside the change-detection report */
export interface AreaStat {
    class: string;
    year1_area_km2: number;
    year2_area_km2: number;
    /** e.g. "↑ 21.5%" or "↓ 8.3%" */
    change_pct: string;
    /** "increasing" | "decreasing" */
    trend: string;
}

/**
 * Matches the JSON shape returned by POST /classification/change-detection
 * { message, report: { year1_prediction, year2_prediction, area_stats[] } }
 */
export interface ChangeDetectionResult {
    message: string;
    report: {
        year1_prediction: string;
        year2_prediction: string;
        area_stats: AreaStat[];
    };
}

/**
 * Upload two images (Year 1 and Year 2) for temporal change detection.
 * FastAPI expects form fields "file1" and "file2".
 */
export async function predictChangeDetection(
    file1: File,
    file2: File,
): Promise<ChangeDetectionResult> {
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    const res = await fetch(`${API_BASE}/classification/change-detection`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
            const json = await res.json();
            if (json?.detail) detail = json.detail;
        } catch { /* ignore */ }
        throw new Error(detail);
    }

    return res.json() as Promise<ChangeDetectionResult>;
}
