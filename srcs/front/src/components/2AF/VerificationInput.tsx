import React, { useState, ChangeEvent } from 'react';
import { get2FAuthUserVerification } from '../../requests/User.Service';
import { useNavigate } from 'react-router-dom';

interface VerificationInputProps {
  userIdArg: number;
}

const VerificationInput: React.FC<VerificationInputProps> = ({ userIdArg }) => {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isCodeValid, setIsCodeValid] = useState<boolean>(false);
  const navigate = useNavigate();

  const verify2FA = async () => {
    const response = await get2FAuthUserVerification(verificationCode, userIdArg);
    if (response.error) {
      setIsCodeValid(true);
      setTimeout(() => setIsCodeValid(false), 1000);
      setVerificationCode('');
    } else
      navigate(response.URL);

  };

  const handleVerificationCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(event.target.value);
  };

  const SecondFactorButtonSytle: React.CSSProperties = {
    backgroundColor: '#5b8731',
    color: '#FFFFFF',
    fontFamily: "'Press Start 2P'",
    fontSize: '15px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    cursor: 'pointer',
    width: '220px',
    marginLeft: '2%',
    transition: 'opacity 0.3s',
  };

  const SecondFactorInputStyle: React.CSSProperties = {
    color: 'white',
    fontFamily: "'Press Start 2P'",
    fontSize: '15px',
    padding: '5px 10px',
    width: '240px',
    border: 'none',
    borderBottom: isCodeValid ? '2px solid red' : '2px solid gray',
    background: 'transparent',
    transition: 'border-color 0.5s ease',
  };

  const ContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  return (
    <div style={ContainerStyle}>
      <input style={SecondFactorInputStyle} type="text" value={verificationCode} onChange={handleVerificationCodeChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            verify2FA();
          }
        }}
        maxLength={10}
        />
      <button style={SecondFactorButtonSytle} onClick={verify2FA}>Verificar 2FA</button>
    </div>
  );
};

export default VerificationInput;
