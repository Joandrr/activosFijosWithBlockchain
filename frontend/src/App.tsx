import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Activos from "./pages/Activos";
import ActivoForm from "./pages/ActivoForm";
import Movimientos from "./pages/Movimientos";
import MovimientoForm from "./pages/MovimientoForm";
import Marcas from "./pages/Marcas";
import Tipos from "./pages/Tipos";
import Lugares from "./pages/Lugares";
import TiposLugar from "./pages/TiposLugar";
import DetalleTipo from "./pages/DetalleTipo";
import Usuarios from "./pages/Usuarios";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activos" element={<Activos />} />
            <Route path="/activos/nuevo" element={<ActivoForm />} />
            <Route path="/activos/editar/:id" element={<ActivoForm />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route path="/movimientos/nuevo" element={<MovimientoForm />} />
            <Route path="/movimientos/editar/:id" element={<MovimientoForm />} />
            <Route path="/marcas" element={<Marcas />} />
            <Route path="/tipos" element={<Tipos />} />
            <Route path="/lugares" element={<Lugares />} />
            <Route path="/tipos-lugar" element={<TiposLugar />} />
            <Route path="/detalles-tipo" element={<DetalleTipo />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
