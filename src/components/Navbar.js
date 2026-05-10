import {Link} from "react-router-dom";

function Navbar() {
    return (
        <nav className="bg-gray-950 text-white p-4 flex gap-4 justify-center font-dogica items-center mx-auto ">
            <div className="navbar-brand flex flex-row basis-0.5/6 justify-center">
                <Link to="/">
                    <img src="https://static.wikia.nocookie.net/warframe/images/7/77/AoiAccoladeGlyph.png/revision/latest/scale-to-width-down/250?cb=20241214132840"
                    alt="logo" className="h-[115px] w-[115px]"></img>
                </Link>
            </div>
                
            <div className="navbar-links flex flex-row gap-4 justify-center basis-5/6">
                <Link className="underline hover-underline" to="/">Inicio</Link> |
                <Link className="underline hover-underline " to="/cosmetics_store">Tienda de Cosméticos</Link> |
                <Link className="underline hover-underline" to="/premium_store">Tienda Premium</Link> |
                <Link className="underline hover-underline" to="/battle_pass">Pase de Batalla</Link> |
                <Link className="underline hover-underline" to="/login">Iniciar Sesión</Link>
            </div>

            <div>
                
            </div>
                 
            
        </nav>
    );
}

export default Navbar