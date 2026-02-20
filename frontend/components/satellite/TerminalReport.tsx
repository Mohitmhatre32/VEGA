'use client';

import { useEffect, useState } from 'react';

interface ReportData {
    sectorId: string;
    classification: string;
    confidence: number;
    vegetationDensity: string;
    elevation: string;
    moisture: string;
    aiVersion: string;
}

interface TerminalReportProps {
    data?: ReportData;
    isVisible?: boolean;
}

const DEFAULT_DATA: ReportData = {
    sectorId: 'XZ-417',
    classification: 'MIXED TERRAIN',
    confidence: 87.6,
    vegetationDensity: 'MODERATE',
    elevation: '248m ASL',
    moisture: '62.3%',
    aiVersion: 'ISRO-3.2.1',
};

const REPORT_LINES = (d: ReportData) => [
    '──────────────────────────',
    ' TERRAIN ANALYSIS REPORT  ',
    '──────────────────────────',
    `SECTOR ID    : ${d.sectorId}`,
    `TIMESTAMP    : ${new Date().toISOString().split('T')[0]}`,
    '──────────────────────────',
    `CLASSIFICATION: ${d.classification}`,
    `CONFIDENCE   : ${d.confidence.toFixed(1)}%`,
    `VEG DENSITY  : ${d.vegetationDensity}`,
    `ELEVATION    : ${d.elevation}`,
    `MOISTURE     : ${d.moisture}`,
    '──────────────────────────',
    `AI ENGINE    : ${d.aiVersion}`,
    'STATUS       : NOMINAL',
    '──────────────────────────',
];

export function TerminalReport({ data = DEFAULT_DATA, isVisible = true }: TerminalReportProps) {
    const [visibleLines, setVisibleLines] = useState<string[]>([]);
    const [countedConf, setCountedConf] = useState(0);
    const [flickering, setFlickering] = useState(false);

    const lines = REPORT_LINES(data);

    useEffect(() => {
        if (!isVisible) {
            setVisibleLines([]);
            setCountedConf(0);
            return;
        }

        setVisibleLines([]);
        setCountedConf(0);
        let i = 0;

        const interval = setInterval(() => {
            if (i < lines.length) {
                setVisibleLines((prev) => [...prev, lines[i]]);
                i++;
            } else {
                clearInterval(interval);
                // Count up confidence
                setFlickering(true);
                let c = 0;
                const confTimer = setInterval(() => {
                    c += 2.4;
                    setCountedConf(Math.min(c, data.confidence));
                    if (c >= data.confidence) {
                        clearInterval(confTimer);
                        setFlickering(false);
                    }
                }, 30);
            }
        }, 60);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, data.sectorId]);

    return (
        <div className="terminal-text text-xs leading-5 text-accent-green/90 select-none">
            {visibleLines.map((line, i) => {
                const isConf = line.startsWith('CONFIDENCE');
                return (
                    <div key={i} className="whitespace-pre">
                        {isConf ? (
                            <span>
                                {'CONFIDENCE   : '}
                                <span
                                    className={flickering ? 'opacity-50' : 'text-accent-cyan'}
                                    style={{ transition: 'opacity 0.1s' }}
                                >
                                    {countedConf.toFixed(1)}%
                                </span>
                            </span>
                        ) : (
                            <span className={line.startsWith('──') ? 'text-accent-cyan/30' : ''}>{line}</span>
                        )}
                    </div>
                );
            })}
            {visibleLines.length < lines.length && (
                <div className="terminal-cursor text-accent-green/70" />
            )}
        </div>
    );
}
