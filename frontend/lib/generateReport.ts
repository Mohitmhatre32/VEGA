/**
 * generateAnalysisReport
 * ─────────────────────────────────────────────────────────────────────────
 * Builds a multi-page PDF report for all analysed satellite images and
 * triggers an automatic browser download.
 *
 * Layout:
 *   Page 1 – Cover page  (title, timestamp, classified image count)
 *   Page 2+ – Per-image detail (filename, prediction, confidence bar,
 *              class breakdown table, pie-donut chart)
 *   Last page – Summary table (all images in one table)
 *
 * If uploads array is empty / no results, every value is shown as 0 / N/A.
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

// ── Colour palette (matches orbital theme) ──────────────────────────────────
type RGB = [number, number, number];
const CYAN: RGB = [0, 220, 240];
const GREEN: RGB = [0, 230, 130];
const AMBER: RGB = [255, 184, 0];
const DARK_BG: RGB = [7, 11, 20];
const MID_BG: RGB = [14, 22, 40];
const BORDER: RGB = [30, 50, 80];
const WHITE: RGB = [230, 241, 255];
const DIM: RGB = [100, 120, 150];

const TERRAIN_COLOURS: Record<string, [number, number, number]> = {
    Forest: [0, 200, 80],
    Water: [0, 100, 255],
    Urban: [220, 50, 90],
    Agriculture: [255, 180, 0],
    Barren: [160, 90, 40],
    Grassland: [100, 200, 60],
    Snow: [200, 220, 255],
    Desert: [220, 180, 80],
};

function terrainColor(cls: string): [number, number, number] {
    return TERRAIN_COLOURS[cls] ?? [120, 130, 150];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function setFill(doc: import('jspdf').jsPDF, rgb: readonly [number, number, number]) {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setDraw(doc: import('jspdf').jsPDF, rgb: readonly [number, number, number]) {
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}
function setTextCol(doc: import('jspdf').jsPDF, rgb: readonly [number, number, number]) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function bg(doc: import('jspdf').jsPDF) {
    setFill(doc, DARK_BG);
    doc.rect(0, 0, 210, 297, 'F');
}

function hRule(doc: import('jspdf').jsPDF, y: number, color: readonly [number, number, number] = BORDER) {
    setDraw(doc, color);
    doc.setLineWidth(0.2);
    doc.line(16, y, 194, y);
}

function labelSmall(doc: import('jspdf').jsPDF, text: string, x: number, y: number, color: readonly [number, number, number] = DIM) {
    setTextCol(doc, color);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text(text.toUpperCase(), x, y, { charSpace: 0.6 });
}

function valueText(doc: import('jspdf').jsPDF, text: string, x: number, y: number, color: readonly [number, number, number] = WHITE) {
    setTextCol(doc, color);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x, y);
}

// Mini progress bar
function progressBar(
    doc: import('jspdf').jsPDF,
    x: number, y: number, w: number, h: number,
    pct: number,
    color: readonly [number, number, number] = CYAN,
) {
    // Track
    setFill(doc, MID_BG);
    setDraw(doc, BORDER);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, w, h, 0.5, 0.5, 'F');
    // Fill
    if (pct > 0) {
        setFill(doc, color);
        doc.roundedRect(x, y, Math.max(w * (pct / 100), 0.5), h, 0.5, 0.5, 'F');
    }
}

// Simple pie / donut chart drawn with doc.ellipse sectors (approximated with triangles)
function donutChart(
    doc: import('jspdf').jsPDF,
    cx: number, cy: number, r: number,
    segments: { pct: number; label: string; color: readonly [number, number, number] }[],
) {
    let angle = -Math.PI / 2;
    for (const seg of segments) {
        if (seg.pct <= 0) continue;
        const sweep = (seg.pct / 100) * 2 * Math.PI;
        const steps = Math.max(Math.ceil(sweep / 0.1), 4);
        setFill(doc, seg.color);

        // Draw filled sector as a polygon
        const pts: { x: number; y: number }[] = [{ x: cx, y: cy }];
        for (let i = 0; i <= steps; i++) {
            const a = angle + (i / steps) * sweep;
            pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
        }


        // Convert to polygon lines
        (doc as unknown as { lines: (l: number[][], x: number, y: number, s: number[], style: string, closed: boolean) => void })
            .lines(
                pts.slice(1).map((p, i2) => {
                    const prev = i2 === 0 ? pts[0] : pts[i2];
                    return [p.x - prev.x, p.y - prev.y];
                }),
                pts[0].x, pts[0].y,
                [1, 1],
                'F',
                true,
            );

        angle += sweep;
    }

    // Inner circle (donut hole)
    setFill(doc, DARK_BG);
    doc.circle(cx, cy, r * 0.5, 'F');
}

// ── Main export function ─────────────────────────────────────────────────────

export async function generateAnalysisReport(uploads: UploadEntry[]) {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const now = new Date();
    const ts = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const completed = uploads.filter((u) => u.step === 3 && u.result);
    const total = uploads.length;
    const totalMB = uploads.reduce((s, u) => s + u.size, 0) / 1024 / 1024;

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ══════════════════════════════════════════════════════════════════════════
    bg(doc);

    // Top accent bar
    setFill(doc, CYAN);
    doc.rect(0, 0, 210, 2, 'F');

    // Satellite icon block
    setFill(doc, MID_BG);
    setDraw(doc, BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(16, 20, 178, 50, 2, 2, 'FD');

    // Icon placeholder — antenna
    setFill(doc, CYAN);
    doc.circle(105, 40, 4, 'F');
    setFill(doc, DARK_BG);
    doc.circle(105, 40, 2.5, 'F');

    // Title
    setTextCol(doc, CYAN);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ORBITAL TERRAIN INTELLIGENCE', 105, 56, { align: 'center' });

    setTextCol(doc, WHITE);
    doc.setFontSize(13);
    doc.text('SATELLITE IMAGE ANALYSIS REPORT', 105, 64, { align: 'center' });

    labelSmall(doc, `Generated: ${ts}  ·  ISRO AI Mission Control`, 105, 72, DIM);

    // Stats row
    const statItems = [
        { label: 'Images Processed', value: String(total || 0), color: CYAN },
        { label: 'Classified', value: String(completed.length || 0), color: GREEN },
        { label: 'Total Data', value: `${totalMB.toFixed(1)} MB`, color: AMBER },
        { label: 'Errors', value: String(uploads.filter(u => u.error).length), color: [220, 50, 90] as [number, number, number] },
    ];

    statItems.forEach(({ label, value, color }, i) => {
        const x = 20 + i * 44;
        const y = 85;
        setFill(doc, MID_BG);
        setDraw(doc, color);
        doc.setLineWidth(0.4);
        doc.roundedRect(x, y, 38, 22, 1.5, 1.5, 'FD');

        setTextCol(doc, color as [number, number, number]);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(value, x + 19, y + 12, { align: 'center' });

        labelSmall(doc, label, x + 19, y + 19, DIM);
    });

    // Divider
    hRule(doc, 115, CYAN);

    // Classification summary label
    setTextCol(doc, WHITE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLASSIFICATION SUMMARY', 16, 124);

    // Summary table (top of cover)
    const summaryRows = completed.length > 0
        ? completed.map((u) => [
            u.result!.filename,
            u.result!.prediction,
            u.result!.confidence,
            `${(u.size / 1024 / 1024).toFixed(2)} MB`,
            'COMPLETE',
        ])
        : [['—', 'N/A', '0%', '0 MB', 'NO DATA']];

    autoTable(doc, {
        startY: 128,
        head: [['Filename', 'Prediction', 'Confidence', 'Size', 'Status']],
        body: summaryRows,
        styles: {
            fillColor: MID_BG,
            textColor: WHITE,
            fontSize: 8,
            cellPadding: 3,
            font: 'courier',
        },
        headStyles: {
            fillColor: [0, 60, 80] as [number, number, number],
            textColor: CYAN,
            fontStyle: 'bold',
            fontSize: 8,
        },
        alternateRowStyles: { fillColor: DARK_BG },
        tableLineColor: BORDER,
        tableLineWidth: 0.2,
        margin: { left: 16, right: 16 },
    });

    // Footer
    setTextCol(doc, DIM);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text('CLASSIFIED // AUTHORIZED PERSONNEL ONLY', 105, 285, { align: 'center', charSpace: 0.5 });
    hRule(doc, 288, BORDER);
    doc.text('Page 1', 194, 293, { align: 'right' });

    // ══════════════════════════════════════════════════════════════════════════
    // PAGES 2+  — PER IMAGE DETAIL
    // ══════════════════════════════════════════════════════════════════════════

    for (let idx = 0; idx < Math.max(completed.length, 1); idx++) {
        doc.addPage();
        bg(doc);

        // Top accent bar (coloured by index)
        setFill(doc, idx % 2 === 0 ? CYAN : GREEN);
        doc.rect(0, 0, 210, 1.5, 'F');

        const u = completed[idx];
        const res = u?.result;

        // Page heading
        labelSmall(doc, `Analysis Report  ·  Image ${idx + 1} of ${Math.max(completed.length, 1)}`, 16, 14, DIM);
        setTextCol(doc, WHITE);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(res?.filename ?? 'No data available', 16, 22, { maxWidth: 170 });

        hRule(doc, 26, BORDER);

        if (!res) {
            // Empty state
            setTextCol(doc, DIM);
            doc.setFontSize(10);
            doc.text('No classification data available for this entry.', 105, 80, { align: 'center' });
            doc.text('Upload and analyse an image to populate this section.', 105, 90, { align: 'center' });
            continue;
        }

        // ── Left column ──────────────────────────────────────────────────────────
        const confPct = parseFloat(res.confidence) || 0;

        // Prediction card
        setFill(doc, MID_BG);
        setDraw(doc, BORDER);
        doc.setLineWidth(0.2);
        doc.roundedRect(16, 30, 85, 42, 1.5, 1.5, 'FD');

        labelSmall(doc, 'Predicted Class', 22, 40, DIM);
        setTextCol(doc, CYAN);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(res.prediction, 22, 52);

        labelSmall(doc, 'Confidence Score', 22, 62, DIM);
        setTextCol(doc, GREEN);
        doc.setFontSize(14);
        doc.text(res.confidence, 22, 70);

        // Confidence bar card
        setFill(doc, MID_BG);
        doc.roundedRect(16, 76, 85, 16, 1.5, 1.5, 'FD');
        labelSmall(doc, 'Confidence', 22, 83, DIM);
        progressBar(doc, 22, 85, 73, 4, confPct, CYAN);
        setTextCol(doc, CYAN);
        doc.setFontSize(8);
        doc.text(`${confPct.toFixed(1)}%`, 98, 89, { align: 'right' });

        // File metadata card
        setFill(doc, MID_BG);
        doc.roundedRect(16, 96, 85, 30, 1.5, 1.5, 'FD');
        labelSmall(doc, 'File Metadata', 22, 104, DIM);

        const metaItems = [
            ['Filename', res.filename],
            ['File Size', `${(u.size / 1024 / 1024).toFixed(2)} MB`],
            ['Status', 'COMPLETE'],
        ];
        metaItems.forEach(([k, v], mi) => {
            labelSmall(doc, k, 22, 109 + mi * 7, DIM);
            setTextCol(doc, WHITE);
            doc.setFontSize(8);
            doc.setFont('courier', 'normal');
            doc.text(v, 70, 109 + mi * 7, { align: 'right', maxWidth: 25 });
        });

        // ── Right column — donut chart ───────────────────────────────────────────
        const breakdownEntries = Object.entries(res.breakdown ?? {});
        // normalise so they sum to 100
        const total100 = breakdownEntries.reduce((s, [, v]) => s + v, 0) || 100;
        const segments = breakdownEntries.map(([cls, v]) => ({
            pct: (v / total100) * 100,
            label: cls,
            color: terrainColor(cls),
        }));

        if (segments.length === 0) {
            segments.push({ pct: 100, label: 'No Data', color: MID_BG });
        }

        // Donut chart
        donutChart(doc, 155, 70, 28, segments);

        // Legend
        setTextCol(doc, WHITE);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Class Distribution', 109, 104);

        segments.forEach(({ pct, label, color }, si) => {
            const ly = 109 + si * 7;
            setFill(doc, color);
            doc.roundedRect(109, ly - 3, 4, 4, 0.5, 0.5, 'F');
            labelSmall(doc, label, 115, ly, WHITE);
            setTextCol(doc, CYAN);
            doc.setFontSize(8);
            doc.text(`${pct.toFixed(1)}%`, 194, ly, { align: 'right' });
        });

        // ── Class breakdown table ────────────────────────────────────────────────
        const tableY = 132;
        hRule(doc, tableY - 4, BORDER);
        labelSmall(doc, 'Full Class Breakdown', 16, tableY, DIM);

        const breakdownRows = breakdownEntries.length > 0
            ? breakdownEntries.map(([cls, v]) => [cls, `${v.toFixed(1)}%`, v >= 50 ? 'DOMINANT' : v >= 20 ? 'SIGNIFICANT' : 'TRACE'])
            : [['No data', '0%', 'N/A']];

        autoTable(doc, {
            startY: tableY + 4,
            head: [['Terrain Class', 'Probability', 'Classification']],
            body: breakdownRows,
            styles: {
                fillColor: MID_BG,
                textColor: WHITE,
                fontSize: 8,
                cellPadding: 3,
                font: 'courier',
            },
            headStyles: {
                fillColor: [0, 60, 80] as [number, number, number],
                textColor: CYAN,
                fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: DARK_BG },
            tableLineColor: BORDER,
            tableLineWidth: 0.2,
            margin: { left: 16, right: 16 },
            didParseCell: (d) => {
                if (d.section === 'body' && d.column.index === 2) {
                    const v = String(d.cell.raw);
                    d.cell.styles.textColor = v === 'DOMINANT' ? CYAN : v === 'SIGNIFICANT' ? GREEN : DIM;
                }
            },
        });

        // Page footer
        setTextCol(doc, DIM);
        doc.setFontSize(7);
        doc.setFont('courier', 'normal');
        hRule(doc, 288, BORDER);
        doc.text('ORBITAL TERRAIN INTELLIGENCE · ISRO AI MISSION CONTROL', 16, 293, { charSpace: 0.4 });
        doc.text(`Page ${idx + 2}`, 194, 293, { align: 'right' });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LAST PAGE — AGGREGATE STATS
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    bg(doc);
    setFill(doc, AMBER);
    doc.rect(0, 0, 210, 1.5, 'F');

    labelSmall(doc, 'Aggregate Statistics  ·  All Sessions', 16, 14, DIM);
    setTextCol(doc, WHITE);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('SESSION SUMMARY', 16, 22);
    hRule(doc, 26, BORDER);

    // Overall stats
    const classMap: Record<string, number> = {};
    completed.forEach((u) => {
        const cls = u.result!.prediction;
        classMap[cls] = (classMap[cls] ?? 0) + 1;
    });

    const classRows = Object.entries(classMap).length > 0
        ? Object.entries(classMap).map(([cls, cnt]) => [cls, String(cnt), `${((cnt / Math.max(completed.length, 1)) * 100).toFixed(1)}%`])
        : [['N/A', '0', '0%']];

    autoTable(doc, {
        startY: 30,
        head: [['Terrain Class', 'Images', 'Share']],
        body: classRows,
        styles: { fillColor: MID_BG, textColor: WHITE, fontSize: 9, cellPadding: 3, font: 'courier' },
        headStyles: { fillColor: [40, 30, 0] as [number, number, number], textColor: AMBER, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: DARK_BG },
        tableLineColor: BORDER,
        tableLineWidth: 0.2,
        margin: { left: 16, right: 16 },
    });

    setTextCol(doc, DIM);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    hRule(doc, 288, BORDER);
    doc.text('CLASSIFIED // AUTHORIZED PERSONNEL ONLY', 105, 293, { align: 'center', charSpace: 0.5 });

    // ── Download ────────────────────────────────────────────────────────────────
    const fname = `orbital-report-${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(fname);
}
