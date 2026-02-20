import { Navbar } from '@/components/satellite/Navbar';
import { HeroSection } from '@/components/satellite/HeroSection';
import { FeaturesSection } from '@/components/satellite/FeaturesSection';
import { MapViewer } from '@/components/satellite/MapViewer';
import { UploadPanel } from '@/components/satellite/UploadPanel';
import { ClassificationVisualization } from '@/components/satellite/ClassificationVisualization';
import { AnalyticsDashboard } from '@/components/satellite/AnalyticsDashboard';
import { ChangeDetectionModule } from '@/components/satellite/ChangeDetectionModule';
import { BatchProcessingResults } from '@/components/satellite/BatchProcessingResults';

export const metadata = {
  title: 'Satellite Terrain Dashboard | AI-Powered Classification',
  description: 'Advanced satellite imagery processing with real-time terrain classification and analytics',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      <div className="pt-16">
        <section id="dashboard">
          <HeroSection />
          <FeaturesSection />
          <MapViewer />
        </section>
        
        <section id="analysis">
          <UploadPanel />
          <ClassificationVisualization />
        </section>
        
        <section id="results">
          <AnalyticsDashboard />
          <ChangeDetectionModule />
          <BatchProcessingResults />
        </section>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p className="mb-2">Satellite Terrain Classification Dashboard</p>
          <p className="text-sm">Built with Next.js, Framer Motion, Leaflet, and Recharts</p>
        </div>
      </footer>
    </main>
  );
}
