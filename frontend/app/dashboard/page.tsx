import { Navbar } from '@/components/satellite/Navbar';
import { UploadPanel } from '@/components/satellite/UploadPanel';
import { ClassificationVisualization } from '@/components/satellite/ClassificationVisualization';
import { ChangeDetectionModule } from '@/components/satellite/ChangeDetectionModule';
import { BatchProcessingResults } from '@/components/satellite/BatchProcessingResults';
import { AnalyticsDashboard } from '@/components/satellite/AnalyticsDashboard';
import { StarField } from '@/components/satellite/StarField';

export const metadata = {
    title: 'Orbital Dashboard | Terrain Intelligence',
    description: 'Advanced orbital satellite imagery processing with real-time terrain classification and analytics',
};

function SectorDivider({ label, accent = 'cyan' }: { label: string; accent?: string }) {
    const lines: Record<string, string> = {
        cyan: 'via-accent-cyan/15',
        green: 'via-accent-green/15',
        blue: 'via-accent-blue/15',
        orange: 'via-accent-orange/15',
    };
    const texts: Record<string, string> = {
        cyan: 'text-accent-cyan/30',
        green: 'text-accent-green/30',
        blue: 'text-accent-blue/30',
        orange: 'text-accent-orange/30',
    };
    return (
        <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 py-3">
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${lines[accent]} to-transparent`} />
                <span className={`terminal-text text-[10px] tracking-widest ${texts[accent]}`}>{label}</span>
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${lines[accent]} to-transparent`} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <main className="relative min-h-screen bg-bg-primary text-text-primary selection:bg-accent-cyan/30 selection:text-white overflow-x-hidden">
            <StarField />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#080C18] via-[#0B0F1A] to-[#060910]" />
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{ background: 'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(0,153,255,0.04) 0%, transparent 70%)' }} />
                <div className="absolute top-0 right-0 w-full h-full"
                    style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,245,255,0.03) 0%, transparent 70%)' }} />
            </div>

            <Navbar />

            {/* Dashboard starts directly at upload — no hero, no features */}
            <div className="pt-16">
                <SectorDivider label="UPLOAD · PIPELINE" accent="cyan" />
                <section id="upload"><UploadPanel /></section>

                <SectorDivider label="CLASSIFICATION · OVERLAY" accent="green" />
                <section id="analysis"><ClassificationVisualization /></section>

                <SectorDivider label="TEMPORAL · DETECTION" accent="orange" />
                <section id="change-detection"><ChangeDetectionModule /></section>

                <SectorDivider label="BATCH · QUEUE" accent="green" />
                <section id="batch"><BatchProcessingResults /></section>

                <SectorDivider label="METRICS · SECTOR" accent="blue" />
                <section id="results"><AnalyticsDashboard /></section>
            </div>

            <footer className="relative z-10 border-t border-accent-cyan/8 py-8 px-4 mt-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="terminal-text text-xs text-text-secondary/30 tracking-widest">
                        ORBITAL TERRAIN INTELLIGENCE · ISRO AI PLATFORM
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="pulse-dot" style={{ width: 5, height: 5 }} />
                        <span className="terminal-text text-xs text-accent-green/50 tracking-widest">ALL SYSTEMS NOMINAL</span>
                    </div>
                    <div className="terminal-text text-xs text-text-secondary/20 tracking-widest">v3.2.1 · 2026</div>
                </div>
            </footer>
        </main>
    );
}
