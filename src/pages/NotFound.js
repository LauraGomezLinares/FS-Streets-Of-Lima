import { Link } from "react-router-dom";


export default function NotFound(){
    return(
        <div>
            <h1>404 not found</h1>
            <p>Que miras crack?</p>
            <p>Vuelve p causa <Link to="/">Home</Link>.</p>
        </div>
    );
}