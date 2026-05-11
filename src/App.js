import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CosmeticsStore from "./pages/CosmeticsStore";
import PremiumStore from "./pages/PremiumStore";
import BattlePass from "./pages/BattlePass";
import Login from "./pages/Login";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Navbar />
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<Login />} />

            {/* Protegidas */}
            <Route path="/" element={
              <ProtectedRoute><Home /></ProtectedRoute>
            } />
            <Route path="/cosmetics_store" element={
              <ProtectedRoute><CosmeticsStore /></ProtectedRoute>
            } />
            <Route path="/premium_store" element={
              <ProtectedRoute><PremiumStore /></ProtectedRoute>
            } />
            <Route path="/battle_pass" element={
              <ProtectedRoute><BattlePass /></ProtectedRoute>
            } />

            {/* Ruta desconocida → home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;