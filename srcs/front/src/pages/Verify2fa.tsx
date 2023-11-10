import React, { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import VerificationInput from '../components/2AF/VerificationInput';

function Verify2FA() {
    const [userId, setUserId] = useState<number>(0);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.has("id")) {
            setUserId(Number(searchParams.get("id")));
            searchParams.delete("id");
            setSearchParams(searchParams);
        }
    }, [searchParams, setSearchParams]);

    const NicknamePositionStyle: React.CSSProperties = {
        height: '320px',
        width: '100%',
        top: '320px',
        backgroundColor: '#01624',
    };

    const NicknameTapeStyle: React.CSSProperties = {
        height: '170%',
        width: '100%',
        top: '50%',
        backgroundColor: '#1c2c49',
        position: 'relative',
    };

    const TitleSecondFactorSyle: React.CSSProperties = {
        paddingLeft: '30%',
        paddingTop: '10%',
        color: 'gray',
        fontFamily: "'Press Start 2P'"
    };

    const SecondFactorSyle: React.CSSProperties = {
        paddingLeft: '43.5%',
    };

    return (
        <div style={NicknamePositionStyle}>
            <div style={NicknameTapeStyle}>
                <div>
                    <h1 style={TitleSecondFactorSyle}>Introduce el código de 2FA</h1>
                    <div style={SecondFactorSyle}>
                        <VerificationInput userIdArg={userId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Verify2FA;
