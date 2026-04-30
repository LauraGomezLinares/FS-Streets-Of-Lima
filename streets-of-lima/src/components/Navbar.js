import {Link} from "react-router-dom";

function Navbar() {
    return (
        <nav className="bg-gray-950 text-white p-4 flex gap-4 justify-center">
            <Link to="/">Inicio</Link> |
            <Link to="/cosmetics_store">Tienda de Cosméticos</Link> |
            <Link to="/premium_store">Tienda Premium</Link> |
            <Link to="/battle_pass">Pase de Batalla</Link> |
            <Link to="/login">Iniciar Sesión</Link>
        </nav>
    );
}

export default Navbar