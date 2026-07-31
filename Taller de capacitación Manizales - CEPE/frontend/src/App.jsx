import { HashRouter, Routes, Route } from 'react-router-dom';
import FormularioInscripcion from './formulario/FormularioInscripcion.jsx';
import AdminPanel from './admin/AdminPanel.jsx';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<FormularioInscripcion />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
