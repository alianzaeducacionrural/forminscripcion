import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing.jsx';
import PretestForm from './pretest/PretestForm.jsx';
import PostestForm from './postest/PostestForm.jsx';

// El panel de admin se carga aparte (React.lazy) para que Recharts nunca
// llegue al bundle de los formularios públicos que llenan los docentes.
const AdminPanel = lazy(() => import('./admin/AdminPanel.jsx'));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pretest" element={<PretestForm />} />
        <Route path="/postest" element={<PostestForm />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminPanel />
            </Suspense>
          }
        />
      </Routes>
    </HashRouter>
  );
}
