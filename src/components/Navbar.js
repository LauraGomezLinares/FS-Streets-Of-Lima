import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoStreet from "../assets/Logo_StreetsOfLima.png";


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const linkStyle = {
    color: "#ccc",
    fontFamily: "'Dogica', monospace",
    fontSize: "11px",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textDecorationColor: "#444",
    whiteSpace: "nowrap",
    letterSpacing: "1px",
    transition: "all 0.2s ease",
    display: "block",
  };

  const separatorStyle = {
    color: "#333",
    margin: "0 14px",
    fontFamily: "'Dogica', monospace",
    fontSize: "11px",
    userSelect: "none",
  };

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/cosmetics_store", label: "Tienda de Cosméticos" },
    { to: "/premium_store", label: "Tienda Premium" },
    { to: "/battle_pass", label: "Pase de Batalla" },
  ];

  return (
    <>
      <style>{`
        .navbar { display: flex; align-items: center; background: #000; border-bottom: 1px solid #1a1a1a; padding: 0 1.25rem; height: 70px; gap: 0; font-family: 'Dogica', monospace; position: relative; z-index: 100; }
        .navbar-desktop-links { display: flex; align-items: center; flex: 1; flex-wrap: wrap; gap: 0; }
        .navbar-auth-desktop { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }
        .hamburger { display: none; background: transparent; border: 1px solid #333; padding: 6px 9px; cursor: pointer; flex-direction: column; gap: 4px; border-radius: 3px; }
        .hamburger span { display: block; width: 18px; height: 2px; background: #ccc; transition: all 0.2s; }
        .mobile-menu { display: none; }

        @media (max-width: 768px) {
          .navbar-desktop-links { display: none; }
          .navbar-auth-desktop { display: none; }
          .hamburger { display: flex; margin-left: auto; }
          .mobile-menu {
            display: block;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: #000;
            border-bottom: 1px solid #1a1a1a;
            padding: 1rem 1.25rem;
            z-index: 99;
            transform: translateY(-110%);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.25s ease, opacity 0.2s ease;
          }
          .mobile-menu.open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
          }
          .mobile-link {
            display: block;
            color: #ccc;
            font-family: 'Dogica', monospace;
            font-size: 11px;
            text-decoration: underline;
            text-underline-offset: 3px;
            text-decoration-color: #444;
            letter-spacing: 1px;
            padding: 12px 0;
            border-bottom: 1px solid #111;
            transition: color 0.2s;
          }
          .mobile-link:last-child { border-bottom: none; }
          .mobile-link:hover { color: #fff; }
          .mobile-auth { padding-top: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
          .mobile-username { font-family: 'Dogica', monospace; font-size: 10px; color: #FFDC32; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
          .mobile-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4CAF50; }
        }
      `}</style>

      <nav className="navbar">
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", marginRight: "1.25rem", flexShrink: 0 }}>
          <img
            src={logoStreet}
            alt="Streets of Lima"
            style={{ width: "52px", height: "52px", objectFit: "cover", border: "1px solid #333", borderRadius: "3px" }}
          />
        </Link>

        {/* Desktop links */}
        <div className="navbar-desktop-links">
          {navLinks.map((link, i) => (
            <span key={link.to} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <span style={separatorStyle}>|</span>}
              <Link
                to={link.to}
                style={linkStyle}
                onMouseEnter={(e) => { e.target.style.color = "#fff"; e.target.style.textDecorationColor = "#888"; }}
                onMouseLeave={(e) => { e.target.style.color = "#ccc"; e.target.style.textDecorationColor = "#444"; }}
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="navbar-auth-desktop">
          <span style={separatorStyle}>|</span>
          {user ? (
            <>
              <span style={{ fontFamily: "'Dogica', monospace", fontSize: "10px", color: "#FFDC32", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#4CAF50", flexShrink: 0 }} />
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                style={{ background: "transparent", border: "1px solid #333", color: "#666", fontFamily: "'Dogica', monospace", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 10px", borderRadius: "3px", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff5555"; e.currentTarget.style.color = "#ff5555"; e.currentTarget.style.background = "#140000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#666"; e.currentTarget.style.background = "transparent"; }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={linkStyle}
              onMouseEnter={(e) => { e.target.style.color = "#fff"; e.target.style.textDecorationColor = "#888"; }}
              onMouseLeave={(e) => { e.target.style.color = "#ccc"; e.target.style.textDecorationColor = "#444"; }}
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
          <span style={{ transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to} className="mobile-link" onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div className="mobile-auth">
          {user ? (
            <>
              <span className="mobile-username">
                <span className="mobile-dot" />
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                style={{ background: "transparent", border: "1px solid #333", color: "#666", fontFamily: "'Dogica', monospace", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 10px", borderRadius: "3px", cursor: "pointer" }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </>
  );
}