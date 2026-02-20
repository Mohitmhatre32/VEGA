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
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-cyan/30 selection:text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-blue/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/5 blur-[120px]" />
      </div>
      <Navbar />
      <div className="pt-16">
        <section id="dashboard">
          <HeroSection />
          <FeaturesSection />
          {/* <MapViewer /> */}
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
       
        </div>
      </footer>
    </main>
  );
}
