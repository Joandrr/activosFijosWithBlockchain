import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Activos from "./pages/Activos";
import Movimientos from "./pages/Movimientos";
import Administracion from "./pages/Administracion";
import Usuarios from "./pages/Usuarios";
import Validador from "./pages/Validador";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activos" element={<Activos />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route path="/validador" element={<Validador />} />
            <Route path="/administracion" element={<Administracion />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
