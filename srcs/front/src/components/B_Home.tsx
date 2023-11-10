import React from "react";
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo.png'

function B_Home() {
    const navigate = useNavigate();

    const HomeButton: React.CSSProperties = {
        position: 'absolute',
        width: '5vw',
        // height: '10vh',
        top: '10px',
        left: '10px',
        cursor: 'pointer',
        minWidth: '50px',
        minHeight: '50px',
        zIndex: 999
    };

    const GoHomepage = () => {
        navigate('/homepage');
    };

    return (
        <img src={Logo} alt="Logo for Homepage" className="HomeButton" style={HomeButton} onClick={GoHomepage}>
        </img>
    );
}

export default B_Home;