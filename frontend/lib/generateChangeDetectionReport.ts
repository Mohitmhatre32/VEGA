/**
 * generateChangeDetectionReport
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates a clean, professional white-background PDF report for change
 * detection results and triggers a browser download.
 *
 * Layout:
 *   Page 1  – Header / report meta + two-column summary cards
 *   Page 1+ – Area statistics table with change indicators
 *   Last    – Trend bars + footer
 */

import type { ChangeDetectionResult, AreaStat } from './classificationApi';

// ── Colour palette (professional / light) ────────────────────────────────────
type RGB = [number, number, number];

const BLACK: RGB = [15, 20, 30];
const DARK: RGB = [40, 50, 65];
const MID: RGB = [90, 105, 120];
const LIGHT: RGB = [180, 190, 200];
const PALE: RGB = [240, 243, 247];
const WHITE: RGB = [255, 255, 255];
const NAVY: RGB = [15, 55, 110];
const BLUE: RGB = [25, 100, 210];
const TEAL: RGB = [0, 135, 150];
const GREEN: RGB = [22, 155, 90];
const RED: RGB = [200, 50, 50];
const AMBER: RGB = [210, 130, 20];
const BORDER: RGB = [215, 220, 228];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fill(doc: import('jspdf').jsPDF, c: RGB) {
    doc.setFillColor(c[0], c[1], c[2]);
}
function draw(doc: import('jspdf').jsPDF, c: RGB) {
    doc.setDrawColor(c[0], c[1], c[2]);
}
function textCol(doc: import('jspdf').jsPDF, c: RGB) {
    doc.setTextColor(c[0], c[1], c[2]);
}

function hLine(doc: import('jspdf').jsPDF, y: number, x1 = 18, x2 = 192, color: RGB = BORDER, w = 0.25) {
    draw(doc, color);
    doc.setLineWidth(w);
    doc.line(x1, y, x2, y);
}

/** Trend color based on trend string */
function trendColor(trend: string): RGB {
    if (trend === 'increasing') return GREEN;
    if (trend === 'decreasing') return RED;
    return AMBER;
}

/** Parse change_pct string like "↑ 21.5%" → number */
function parsePct(pct: string): number {
    return parseFloat(pct.replace(/[^0-9.-]/g, '')) || 0;
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function bar(doc: import('jspdf').jsPDF, x: number, y: number, w: number, h: number, pct: number, color: RGB) {
    // track
    fill(doc, PALE);
    doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
    // fill
    const fw = Math.max((Math.abs(pct) / 100) * w, 0.5);
    fill(doc, color);
    doc.roundedRect(x, y, Math.min(fw, w), h, h / 2, h / 2, 'F');
}

// ── Summary stat card ─────────────────────────────────────────────────────────
function statCard(
    doc: import('jspdf').jsPDF,
    x: number, y: number, w: number, h: number,
    label: string, value: string, sub: string,
    accent: RGB,
) {
    // card bg
    fill(doc, WHITE);
    draw(doc, BORDER);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    // left accent strip
    fill(doc, accent);
    doc.roundedRect(x, y, 3, h, 1, 1, 'F');

    // label
    textCol(doc, MID);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), x + 7, y + 7, { charSpace: 0.4 });

    // value
    textCol(doc, accent);
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 7, y + 16);

    // sub
    textCol(doc, MID);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(sub, x + 7, y + 22);
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function generateChangeDetectionReport(
    result: ChangeDetectionResult | null,
    file1Name?: string,
    file2Name?: string,
) {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const rep = result?.report;
    const stats: AreaStat[] = rep?.area_stats ?? [];

    /* ══════════════════════════════════════════════════════════════════════════
       PAGE 1 — HEADER + SUMMARY
    ══════════════════════════════════════════════════════════════════════════ */

    // ── Navy header banner ────────────────────────────────────────────────────
    fill(doc, NAVY);
    doc.rect(0, 0, 210, 36, 'F');

    // Organisation + title
    textCol(doc, WHITE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('ISRO · AI TERRAIN INTELLIGENCE PLATFORM', 18, 10, { charSpace: 0.5 });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Terrain Change Detection Report', 18, 22);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    textCol(doc, LIGHT);
    doc.text(`Generated ${dateStr}  ·  ${timeStr}`, 18, 30);

    // Top-right badge
    fill(doc, TEAL);
    doc.roundedRect(148, 9, 44, 18, 2, 2, 'F');
    textCol(doc, WHITE);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('CHANGE DETECTION', 170, 16, { align: 'center', charSpace: 0.3 });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('AI ANALYSIS RESULT', 170, 22, { align: 'center' });

    // ── Meta row ─────────────────────────────────────────────────────────────
    textCol(doc, DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INPUT IMAGES', 18, 46);

    const metaItems = [
        { label: 'Year 1 (Baseline)', value: file1Name ?? 'N/A' },
        { label: 'Year 2 (Comparison)', value: file2Name ?? 'N/A' },
    ];
    metaItems.forEach(({ label, value }, i) => {
        textCol(doc, MID);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(label + ':', 18, 52 + i * 6);
        textCol(doc, BLACK);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 60, 52 + i * 6);
    });

    hLine(doc, 66, 18, 192, BORDER);

    // ── 4 summary stat cards ──────────────────────────────────────────────────
    const totalY1 = stats.reduce((s, r) => s + r.year1_area_km2, 0);
    const totalY2 = stats.reduce((s, r) => s + r.year2_area_km2, 0);
    const netChange = totalY2 - totalY1;
    const biggest = stats.reduce<AreaStat | null>((a, r) => {
        if (!a) return r;
        return Math.abs(parsePct(r.change_pct)) > Math.abs(parsePct(a.change_pct)) ? r : a;
    }, null);

    const cards = [
        { label: 'Year 1 Total Area', value: `${totalY1.toFixed(1)} km²`, sub: 'Baseline coverage', accent: BLUE },
        { label: 'Year 2 Total Area', value: `${totalY2.toFixed(1)} km²`, sub: 'Comparison coverage', accent: TEAL },
        { label: 'Net Area Change', value: `${netChange >= 0 ? '+' : ''}${netChange.toFixed(1)} km²`, sub: 'Overall delta', accent: netChange >= 0 ? GREEN : RED },
        { label: 'Highest Change', value: biggest?.class ?? 'N/A', sub: biggest?.change_pct ?? '—', accent: AMBER },
    ];

    const cardW = 40;
    const cardH = 28;
    cards.forEach((c, i) => {
        statCard(doc, 18 + i * 46, 70, cardW, cardH, c.label, c.value, c.sub, c.accent);
    });

    // ── Year prediction row ───────────────────────────────────────────────────
    const predY = 107;
    fill(doc, PALE);
    doc.roundedRect(18, predY, 174, 16, 2, 2, 'F');

    textCol(doc, DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Year 1 Prediction:', 24, predY + 6);
    textCol(doc, BLUE);
    doc.text(rep?.year1_prediction ?? 'N/A', 70, predY + 6);

    textCol(doc, DARK);
    doc.text('Year 2 Prediction:', 110, predY + 6);
    textCol(doc, TEAL);
    doc.text(rep?.year2_prediction ?? 'N/A', 155, predY + 6);

    // Observations
    textCol(doc, MID);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Overall landscape trend:', 24, predY + 12);
    const overall = stats.filter(s => s.trend === 'increasing').length > stats.filter(s => s.trend === 'decreasing').length
        ? 'Expansion in dominant terrain classes detected'
        : 'Shrinkage in dominant terrain classes detected';
    textCol(doc, BLACK);
    doc.setFontSize(7.5);
    doc.text(overall, 70, predY + 12);

    // ── Area stats table ──────────────────────────────────────────────────────
    hLine(doc, 130, 18, 192, BORDER);
    textCol(doc, DARK);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Per-Class Area Statistics', 18, 138);

    const tableRows = stats.length > 0
        ? stats.map((s) => [
            s.class,
            `${s.year1_area_km2.toFixed(2)} km²`,
            `${s.year2_area_km2.toFixed(2)} km²`,
            `${(s.year2_area_km2 - s.year1_area_km2).toFixed(2)} km²`,
            s.change_pct,
            s.trend.charAt(0).toUpperCase() + s.trend.slice(1),
        ])
        : [['No data', '0', '0', '0', '0%', 'N/A']];

    autoTable(doc, {
        startY: 142,
        head: [['Terrain Class', 'Year 1 Area', 'Year 2 Area', 'Δ Area', '% Change', 'Trend']],
        body: tableRows,
        styles: {
            fillColor: WHITE,
            textColor: DARK,
            fontSize: 8.5,
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            font: 'helvetica',
            lineColor: BORDER,
            lineWidth: 0.2,
        },
        headStyles: {
            fillColor: NAVY,
            textColor: WHITE,
            fontStyle: 'bold',
            fontSize: 8.5,
        },
        alternateRowStyles: { fillColor: PALE },
        tableLineColor: BORDER,
        tableLineWidth: 0.2,
        margin: { left: 18, right: 18 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 38 },
            1: { halign: 'right', cellWidth: 28 },
            2: { halign: 'right', cellWidth: 28 },
            3: { halign: 'right', cellWidth: 28 },
            4: { halign: 'center', cellWidth: 24 },
            5: { halign: 'center', cellWidth: 28 },
        },
        didParseCell: (d) => {
            // Colour % Change column
            if (d.section === 'body' && d.column.index === 4) {
                const raw = String(d.cell.raw);
                d.cell.styles.textColor = raw.startsWith('↑') ? GREEN : raw.startsWith('↓') ? RED : AMBER;
                d.cell.styles.fontStyle = 'bold';
            }
            // Colour Trend column
            if (d.section === 'body' && d.column.index === 5) {
                const raw = String(d.cell.raw).toLowerCase();
                d.cell.styles.textColor = raw === 'increasing' ? GREEN : raw === 'decreasing' ? RED : AMBER;
            }
        },
    });

    /* ══════════════════════════════════════════════════════════════════════════
       PAGE 2 — TREND VISUALIZATION BARS
    ══════════════════════════════════════════════════════════════════════════ */
    doc.addPage();

    // Header stripe
    fill(doc, NAVY);
    doc.rect(0, 0, 210, 14, 'F');
    textCol(doc, WHITE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Change Detection Report  ·  Trend Visualization', 18, 9);
    textCol(doc, LIGHT);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page 2 of 2  ·  ${dateStr}`, 192, 9, { align: 'right' });

    // Section title
    textCol(doc, DARK);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Area Change Trend by Terrain Class', 18, 26);
    hLine(doc, 30, 18, 192, BORDER);

    // Trend bars per class
    if (stats.length === 0) {
        textCol(doc, MID);
        doc.setFontSize(10);
        doc.text('No change detection data available.', 105, 80, { align: 'center' });
    } else {
        const maxChange = Math.max(...stats.map((s) => Math.abs(parsePct(s.change_pct))), 1);

        stats.forEach((s, i) => {
            const rowY = 38 + i * 22;
            const pct = parsePct(s.change_pct);
            const col = trendColor(s.trend);

            // Class label
            textCol(doc, BLACK);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.text(s.class, 18, rowY + 4);

            // Area info
            textCol(doc, MID);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.text(`${s.year1_area_km2.toFixed(1)} → ${s.year2_area_km2.toFixed(1)} km²`, 18, rowY + 9);

            // Bar
            bar(doc, 70, rowY, 100, 5, (Math.abs(pct) / maxChange) * 100, col);

            // Change pct
            textCol(doc, col);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(s.change_pct, 175, rowY + 5, { align: 'right' });

            // Trend badge
            fill(doc, col);
            doc.roundedRect(177, rowY - 0.5, 15, 6, 1, 1, 'F');
            textCol(doc, WHITE);
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'bold');
            doc.text(s.trend === 'increasing' ? '↑ UP' : s.trend === 'decreasing' ? '↓ DN' : '→ –', 184.5, rowY + 4, { align: 'center' });

            // Separator
            if (i < stats.length - 1) hLine(doc, rowY + 16, 18, 192, PALE, 0.15);
        });
    }

    // ── Legend ────────────────────────────────────────────────────────────────
    const legY = Math.max(38 + stats.length * 22 + 10, 180);
    hLine(doc, legY - 4, 18, 192, BORDER);
    textCol(doc, DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Legend', 18, legY + 2);

    const legend = [
        { color: GREEN, label: 'Increasing — terrain class area expanded' },
        { color: RED, label: 'Decreasing — terrain class area shrank' },
        { color: AMBER, label: 'Stable — no significant directional trend' },
    ];
    legend.forEach(({ color, label }, i) => {
        fill(doc, color);
        doc.roundedRect(18, legY + 6 + i * 7, 6, 4, 0.5, 0.5, 'F');
        textCol(doc, DARK);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(label, 28, legY + 9.5 + i * 7);
    });

    // ── Conclusion box ────────────────────────────────────────────────────────
    const conY = legY + 35;
    fill(doc, PALE);
    draw(doc, BORDER);
    doc.setLineWidth(0.25);
    doc.roundedRect(18, conY, 174, 30, 2, 2, 'FD');
    fill(doc, NAVY);
    doc.roundedRect(18, conY, 4, 30, 1, 1, 'F');

    textCol(doc, NAVY);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Analysis Summary', 27, conY + 8);

    const increasing = stats.filter((s) => s.trend === 'increasing').map((s) => s.class).join(', ') || 'None';
    const decreasing = stats.filter((s) => s.trend === 'decreasing').map((s) => s.class).join(', ') || 'None';

    textCol(doc, DARK);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Expanding:   ${increasing}`, 27, conY + 15, { maxWidth: 160 });
    doc.text(`Shrinking:   ${decreasing}`, 27, conY + 22, { maxWidth: 160 });

    // ── Footer ────────────────────────────────────────────────────────────────
    fill(doc, NAVY);
    doc.rect(0, 282, 210, 15, 'F');
    textCol(doc, WHITE);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ISRO · Orbital Terrain Intelligence Platform', 18, 291);
    textCol(doc, LIGHT);
    doc.setFont('helvetica', 'normal');
    doc.text('CONFIDENTIAL — FOR AUTHORIZED USE ONLY', 192, 291, { align: 'right' });

    // ── Page 1 footer too ───────────────────────────────────────────────────
    // (set page 1 footer by going back)
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        fill(doc, NAVY);
        doc.rect(0, 282, 210, 15, 'F');
        textCol(doc, WHITE);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('ISRO · Orbital Terrain Intelligence Platform', 18, 291);
        textCol(doc, LIGHT);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${p} of ${totalPages}  ·  CONFIDENTIAL`, 192, 291, { align: 'right' });
    }

    // ── Download ──────────────────────────────────────────────────────────────
    const fname = `change-detection-${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(fname);
}
