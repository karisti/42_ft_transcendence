import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { SocketContext1, SocketContext2 } from '../SocketContext'
import { get2FAuthUserVerificationRemove } from '../requests/User.Service';

const LogoutButton: React.FC = () => {
    const socket1 = useContext(SocketContext1);
    const socket2 = useContext(SocketContext2);
    const navigate = useNavigate();

    const handleLogout = async () => {
        socket1?.off();
        socket2?.off();
        socket1?.disconnect();
        socket2?.disconnect();
        await get2FAuthUserVerificationRemove();
        localStorage.removeItem('token');
        navigate('/');
    };

    const [buttonStyle, setButtonStyle] = useState<React.CSSProperties>({
        padding: '10px 20px',
        backgroundColor: '#ff6347',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        cursor: 'pointer',
        fontSize: "'Press Start 2P'",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'transform 0.3s ease',
        textDecoration: 'none',
    });

    const LogoutButtonHoverStyle: React.CSSProperties = {
        ...buttonStyle,
        transform: 'scale(1.1)',
    };

    const LogoutIconStyle: React.CSSProperties = {
        animation: 'spin 2s linear infinite',
    };

    return (
        <button style={buttonStyle}
            onClick={handleLogout}
            onMouseOver={() => setButtonStyle(LogoutButtonHoverStyle)}
            onMouseOut={() => setButtonStyle({ ...buttonStyle, transform: 'scale(1)', })}>
            <FaSignOutAlt style={LogoutIconStyle} />
            Desconectar
        </button>

    );
};

export default LogoutButton;
