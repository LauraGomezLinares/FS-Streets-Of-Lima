import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CosmeticsStore from "./pages/CosmeticsStore";
import PremiumStore from "./pages/PremiumStore";
import BattlePass from "./pages/BattlePass";
import Layout from "./components/Layout";
import LoginModal from "./components/LoginModal";



function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/cosmetics_store" element={<PageTransition><CosmeticsStore /></PageTransition>} />
        <Route path="/premium_store" element={<PageTransition><PremiumStore /></PageTransition>} />
        <Route path="/battle_pass" element={<PageTransition><BattlePass /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}


function PageTransition({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}


function GlobalOverlay() {
  const { toastMessage } = useAuth();
  if (!toastMessage) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
      <div className="bg-yellow-400 text-black font-dogica p-4 rounded text-sm tracking-widest shadow-[0_0_20px_rgba(255,220,50,0.5)]">
        {toastMessage}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <GlobalOverlay />
          <LoginModal />     
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;