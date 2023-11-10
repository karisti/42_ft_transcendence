import React from "react";
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Leaderboard.png'

function B_Home() {
    const navigate = useNavigate();

    const LButton: React.CSSProperties = {
        position: 'absolute',
        width: '140px',
        height: '80px',
        top: '90%',
        left: '38%',
        cursor: 'pointer',
    };

    const GoLeaderboard = () => {
        navigate('/leaderboard');
    };

    return (
        <img src={Logo} alt="Logo for Homepage" className="HomeButton" style={LButton} onClick={GoLeaderboard}>
        </img>
    );
}

export default B_Home;
