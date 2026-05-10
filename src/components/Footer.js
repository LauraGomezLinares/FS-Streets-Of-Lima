import {Link} from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-gray-950 text-white p-4 flex gap-4 justify-center font-dogica items-center mx-auto">
            <div className="footer-links-1 flex flex-row gap-2 basis-1/3 justify-start">
                <ul className="list-none tracking-wide m-3 text-md leading-10">
                    <li className="underline hover-underline">About</li>
                    <li className="underline hover-underline">Contact</li>
                    <li className="underline hover-underline">Privacy Policy</li>
                    <li className="underline hover-underline">Support</li>
                    <li className="underline hover-underline">Terms of Service</li>
                </ul>
            </div>

            <div className="footer-logo flex flex-col gap-4 basis-1/3 justify-center items-center">
                <div className="footer-logo-above">
                    <Link to="/">
                        <img src="https://static.wikia.nocookie.net/warframe/images/7/77/AoiAccoladeGlyph.png/revision/latest/scale-to-width-down/250?cb=20241214132840"
                        alt="logo" className="h-[110px] w-[110px]"></img>
                    </Link>
                </div>

                <div className="footer-logos-below flex flex-row gap-4">
                    <div className="github">
                        <a href="https://github.com/LauraGomezLinares/FS-Streets-Of-Lima"
                        target="_blank" rel="noopener noreferrer">
                            <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub"></img>
                        </a>
                    </div>

                    <div className="FAQ-logo">
                        <a className="not yet" href="https://www.youtube.com/watch?v=2qqY-pz1iuU"
                        target="_blank" rel="noopener noreferrer">
                            <img src="https://img.icons8.com/?size=100&id=7775&format=png&color=737373" 
                            alt="FAQ"
                            className="h-[32px] w-[32px]"></img>
                        </a>
                    </div>

                    <div className="youtube-logo-test-v2">
                        <a href="https://www.youtube.com/watch?v=YtF6jiLxc88"
                        target="_blank" rel="noopener noreferrer">
                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-youtube-logo-icon-svg-download-png-1466160.png?f=webp" 
                            alt="YouTube"
                            className="h-[32px] w-[32px]"></img>
                        </a>
                    </div>
                </div>

            </div>

            <div className="footer-links-2 flex flex-row gap-2 basis-1/3 justify-end text-end">
                <ul className="list-none tracking-wide m-3 text-md leading-10">
                    <li className="underline hover-underline">Copyright © Year 2026 All rights reserved.</li>
                    <li className="underline hover-underline">Grupo idk Company</li>
                    <li >Development :</li>
                    <ul className="columns-2">
                        <li className="underline hover-underline">GSon🪼⋆࿔･</li>
                        <li className="underline hover-underline">CEGGAX</li>
                        <li className="underline hover-underline">GustavoAIG</li>
                        <li className="underline hover-underline">NataliaOspinal</li>
                        <li className="underline hover-underline">RamiroUTP</li>
                        <li className="underline hover-underline">AlvaroRoldan</li>
                    </ul>
                </ul>
            </div>
        </footer>
    );
}
//GSon, NataliaOspinal, CEGGAX, GustavoAIG, RamiroUTP, AlvaroRoldan.

export default Footer