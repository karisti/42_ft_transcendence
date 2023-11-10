import React from 'react';
import { FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SettingsButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/settings');
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <button style={buttonStyle} onClick={handleClick}>
      <FaCog size={24} color="#ffff" />
    </button>
  );
};

export default SettingsButton;
