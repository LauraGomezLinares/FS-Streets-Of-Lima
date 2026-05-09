import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CosmeticsStore from "./pages/CosmeticsStore";
import PremiumStore from "./pages/PremiumStore";
import BattlePass from "./pages/BattlePass";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/cosmetics_store" element={<CosmeticsStore/>}/>
        <Route path="/premium_store" element={<PremiumStore/>}/>
        <Route path="/battle_pass" element={<BattlePass/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
