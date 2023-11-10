import React, { useEffect } from "react";
import { useLocation, useNavigate, } from 'react-router-dom';
import HomeButton from "../components/B_Home";
import LeaderboardButton from "../components/B_Leaderboard";
import GameButton from "../components/B_General";
import LogoutButton from '../components/B_Logout';
import SocialMenu from "../components/chat-friend-menu/SocialMenu";

function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        return () => {
            if (location.pathname === "/register") {
                navigate('/homepage');
            }
        };
    }, [location, navigate]);

    const Window: React.CSSProperties = {
        height: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    }

    const PlayFriendsButtonStyle: React.CSSProperties = {
        position: 'absolute',
        top: '250px',
        left: '600px',
        display: 'flex',
        alignItems: 'flex-end',
    };

    const PlayButtonStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '250px',
        left: '600px',
        display: 'flex',
        alignItems: 'flex-end',
    };

    const LogoutButtonStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        alignItems: 'flex-end',
    };

    const GoGamePong = () => {
        navigate('/game-selector');
    };

    const GoGameSelector = () => {
        navigate('/game-friends');
    };

    return (

        <div style={Window}>
            <div>
                <HomeButton></HomeButton>
                <LeaderboardButton></LeaderboardButton>
                <section className="B_PFriends" style={PlayFriendsButtonStyle} onClick={GoGamePong}>
                    <GameButton name="Jugar" width={435} height={155} fsize={48}></GameButton>
                </section>
                <section className="B_Play" style={PlayButtonStyle} onClick={GoGameSelector}>
                    <GameButton name="Retar" width={435} height={155} fsize={48}></GameButton>
                </section>
                <section style={LogoutButtonStyle}>
                    <LogoutButton />
                </section>
                <section>
                    <SocialMenu></SocialMenu>
                </section>
            </div>
        </div>
    );
}

export default Home;
