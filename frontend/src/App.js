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
import NotFoundPage from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";



function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/cosmetics_store" element={<PageTransition><CosmeticsStore /></PageTransition>} />
        <Route path="/premium_store" element={<PageTransition><PremiumStore /></PageTransition>} />
        <Route path="/battle_pass" element={<PageTransition><BattlePass /></PageTransition>} />
        <Route path="*" element={<PageTransition> <NotFoundPage /> </PageTransition>}></Route>
        <Route path="/admin" element={ <ProtectedRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute> } />
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
  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none"
        >
          <motion.div 
            initial={{ scale: 0.8, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-yellow-400 text-black font-dogica p-4 rounded text-sm tracking-widest shadow-[0_0_30px_rgba(255,220,50,0.6)]"
          >
            {toastMessage}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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