import { Link } from "react-router-dom";
import logoStreet from "../assets/Logo_StreetsOfLima.png";


function Footer() {
  const linkStyle = {
    color: "#ccc",
    fontFamily: "'Dogica', monospace",
    fontSize: "10px",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textDecorationColor: "#444",
    whiteSpace: "nowrap",
    letterSpacing: "1px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const sectionTitle = {
    color: "#666",
    fontFamily: "'Dogica', monospace",
    fontSize: "10px",
    letterSpacing: "1px",
    marginBottom: "12px",
  };

  return (
    <>
      <style>{`
        .footer { background: #000; border-top: 1px solid #1a1a1a; padding: 2rem; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: start; gap: 2rem; font-family: 'Dogica', monospace; }
        .footer-right { text-align: right; }
        .footer-center { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .footer-icons { display: flex; gap: 18px; align-items: center; }

        @media (max-width: 768px) {
          .footer {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .footer-right { text-align: center; }
          .footer-center { order: -1; }
          .footer-icons { justify-content: center; }
          ul { padding: 0; }
        }
      `}</style>

      <footer className="footer">
        {/* LEFT */}
        <div>
          <div style={sectionTitle}>INFORMATION</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: "2.2" }}>
            {["About", "Contact", "Privacy Policy", "Support", "Terms of Service"].map((item) => (
              <li
                key={item}
                style={linkStyle}
                onMouseEnter={(e) => { e.target.style.color = "#fff"; e.target.style.textDecorationColor = "#888"; }}
                onMouseLeave={(e) => { e.target.style.color = "#ccc"; e.target.style.textDecorationColor = "#444"; }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CENTER */}
        <div className="footer-center">
          <Link to="/">
            <img
              src={logoStreet}
              alt="logo"
              style={{ width: "220px", height: "150px", objectFit: "cover", border: "none", borderRadius: "4px" }}
            />
          </Link>
          <div className="footer-icons">
            <a href="https://github.com/LauraGomezLinares/FS-Streets-Of-Lima" target="_blank" rel="noopener noreferrer">
              <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" style={{ width: "28px", height: "28px", transition: "all 0.2s ease" }} />
            </a>
            <a href="https://www.youtube.com/watch?v=2qqY-pz1iuU" target="_blank" rel="noopener noreferrer">
              <img src="https://img.icons8.com/?size=100&id=7775&format=png&color=737373" alt="FAQ" style={{ width: "28px", height: "28px" }} />
            </a>
            <a href="https://www.youtube.com/watch?v=YtF6jiLxc88" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn.iconscout.com/icon/free/png-256/free-youtube-logo-icon-svg-download-png-1466160.png?f=webp" alt="YouTube" style={{ width: "28px", height: "28px" }} />
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="footer-right">
          <div style={sectionTitle}>DEVELOPMENT</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: "2.2" }}>
            <li style={{ ...linkStyle, color: "#888" }}>Copyright © 2026</li>
            <li style={{ ...linkStyle, color: "#888" }}>Grupo idk Company</li>
            <li style={{ color: "#666", fontSize: "10px", marginTop: "10px", fontFamily: "'Dogica', monospace" }}>TEAM :</li>
            {["GSon🪼⋆࿔･", "CEGGAX", "GustavoAIG", "NataliaOspinal", "RamiroUTP", "AlvaroRoldan"].map((dev) => (
              <li
                key={dev}
                style={linkStyle}
                onMouseEnter={(e) => { e.target.style.color = "#fff"; e.target.style.textDecorationColor = "#888"; }}
                onMouseLeave={(e) => { e.target.style.color = "#ccc"; e.target.style.textDecorationColor = "#444"; }}
              >
                {dev}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
}

export default Footer;