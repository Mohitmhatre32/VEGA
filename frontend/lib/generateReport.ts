/**
 * generateAnalysisReport
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds a professional white-background PDF report for analysed images.
 */

import type { PredictionResult } from './classificationApi';

interface UploadEntry {
    id: string;
    name: string;
    size: number;
    step: number;
    error?: string;
    result?: PredictionResult;
}

// ── Colour palette (Professional / Clean) ────────────────────────────────────
type RGB = [number, number, number];

const BLACK: RGB = [30, 30, 30];
const DARK_GRAY: RGB = [60, 60, 60];
const MED_GRAY: RGB = [100, 100, 100];
const LIGHT_GRAY: RGB = [200, 200, 200];
const ACCENT_BLUE: RGB = [0, 82, 204]; // Professional blue
const ACCENT_GREEN: RGB = [40, 167, 69];
const BORDER: RGB = [220, 220, 220];
const WHITE: RGB = [255, 255, 255];
const PALE_BLUE: RGB = [240, 245, 255];

const TERRAIN_COLOURS: Record<string, RGB> = {
    Forest: [34, 139, 34],
    Water: [0, 105, 148],
    Urban: [70, 70, 70],
    Agriculture: [154, 205, 50],
    Barren: [160, 82, 45],
    Grassland: [124, 252, 0],
    Snow: [240, 248, 255],
    Desert: [237, 201, 175],
};

function terrainColor(cls: string): RGB {
    return TERRAIN_COLOURS[cls] ?? [150, 150, 150];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function setFill(doc: import('jspdf').jsPDF, rgb: RGB) {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setDraw(doc: import('jspdf').jsPDF, rgb: RGB) {
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}
function setTextCol(doc: import('jspdf').jsPDF, rgb: RGB) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function hRule(doc: import('jspdf').jsPDF, y: number, color: RGB = BORDER) {
    setDraw(doc, color);
    doc.setLineWidth(0.2);
    doc.line(16, y, 194, y);
}

// Donut chart using approximated sectors
function donutChart(
    doc: import('jspdf').jsPDF,
    cx: number, cy: number, r: number,
    segments: { pct: number; label: string; color: RGB }[],
) {
    let angle = -Math.PI / 2;
    for (const seg of segments) {
        if (seg.pct <= 0) continue;
        const sweep = (seg.pct / 100) * 2 * Math.PI;
        const steps = Math.max(Math.ceil(sweep / 0.1), 4);
        setFill(doc, seg.color);

        const pts: { x: number; y: number }[] = [{ x: cx, y: cy }];
        for (let i = 0; i <= steps; i++) {
            const a = angle + (i / steps) * sweep;
            pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
        }

        (doc as any).lines(
            pts.slice(1).map((p, i2) => {
                const prev = i2 === 0 ? pts[0] : pts[i2];
                return [p.x - prev.x, p.y - prev.y];
            }),
            pts[0].x, pts[0].y,
            [1, 1],
            'F',
            true
        );

        angle += sweep;
    }

    // Hole
    setFill(doc, WHITE);
    doc.circle(cx, cy, r * 0.5, 'F');
}

// ── Main Export ─────────────────────────────────────────────────────────────

export async function generateAnalysisReport(uploads: UploadEntry[]) {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const now = new Date();
    const ts = now.toLocaleString();

    const completed = uploads.filter((u) => u.step === 3 && u.result);

    // Cover Page
    setTextCol(doc, ACCENT_BLUE);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Satellite Imagery Analysis Report', 105, 40, { align: 'center' });

    setTextCol(doc, MED_GRAY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${ts}`, 105, 50, { align: 'center' });

    hRule(doc, 60, ACCENT_BLUE);

    // Summary Metrics
    const totalProcessed = uploads.length;
    const totalClassified = completed.length;

    setTextCol(doc, BLACK);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Mission Overview', 16, 80);

    autoTable(doc, {
        startY: 85,
        body: [
            ['Total Images in Queue', String(totalProcessed)],
            ['Successfully Classified', String(totalClassified)],
            ['Pending / Errors', String(totalProcessed - totalClassified)],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 4 },
    });

    // Pages for each result
    for (let idx = 0; idx < Math.max(completed.length, 0); idx++) {
        doc.addPage();
        const u = completed[idx];
        const res = u.result!;

        setTextCol(doc, ACCENT_BLUE);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Image Analysis: ${res.filename}`, 16, 20);
        hRule(doc, 25);

        // Confidence Card
        setFill(doc, PALE_BLUE);
        doc.roundedRect(16, 35, 178, 25, 2, 2, 'F');

        setTextCol(doc, BLACK);
        doc.setFontSize(10);
        doc.text('PRIMARY CLASSIFICATION', 20, 42);

        setTextCol(doc, ACCENT_BLUE);
        doc.setFontSize(14);
        doc.text(res.prediction, 20, 52);

        setTextCol(doc, MED_GRAY);
        doc.setFontSize(10);
        doc.text(`Confidence: ${res.confidence}`, 140, 52);

        // Donut chart
        const breakdown = Object.entries(res.breakdown);
        const segments = breakdown.map(([label, pct]) => ({
            pct,
            label,
            color: terrainColor(label),
        }));

        donutChart(doc, 150, 100, 30, segments);

        // Legend / Breakdown Table
        autoTable(doc, {
            startY: 140,
            head: [['Terrain Category', 'Probability %']],
            body: breakdown.map(([k, v]) => [k, `${v.toFixed(1)}%`]),
            theme: 'striped',
            headStyles: { fillColor: ACCENT_BLUE },
            styles: { fontSize: 9 },
        });
    }

    if (completed.length === 0) {
        doc.addPage();
        setTextCol(doc, MED_GRAY);
        doc.setFontSize(12);
        doc.text('No classified data available for this session.', 105, 100, { align: 'center' });
    }

    doc.save(`analysis-report-${now.getTime()}.pdf`);
}
