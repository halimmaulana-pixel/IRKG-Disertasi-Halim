import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const KGExplorer = lazy(() => import('./pages/KGExplorer'));
const CRIDashboard = lazy(() => import('./pages/CRIDashboard'));
const Ablation = lazy(() => import('./pages/Ablation'));
const Compare = lazy(() => import('./pages/Compare'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const UploadCPL = lazy(() => import('./pages/UploadCPL'));
const Infographics = lazy(() => import('./pages/Infographics'));
const DataQuality = lazy(() => import('./pages/DataQuality'));
const DomainMap = lazy(() => import('./pages/DomainMap'));
const ProdiMapping = lazy(() => import('./pages/ProdiMapping'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Suspense
          fallback={
            <div className="pt-[52px] min-h-screen bg-bg text-white flex items-center justify-center">
              <div className="rounded-xl border border-border bg-bg2 px-5 py-4 text-sm text-gray-300">
                Memuat halaman...
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kg" element={<KGExplorer />} />
            <Route path="/cri" element={<CRIDashboard />} />
            <Route path="/ablation" element={<Ablation />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/infografis" element={<Infographics />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/upload" element={<UploadCPL />} />
            <Route path="/quality" element={<DataQuality />} />
            <Route path="/domain-map" element={<DomainMap />} />
            <Route path="/prodi-mapping" element={<ProdiMapping />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
