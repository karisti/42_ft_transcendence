import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUserImage, getUserProfile } from "../requests/User.Service";
import SocialMenu from "../components/chat-friend-menu/SocialMenu";
import HomeButton from "../components/B_Home";
import { getUserMatches } from "../requests/GameData.Service";

interface User {
    userId: string,
    nick: string,
    avatarUri: string,
    rank: number,
    avatarFile?: string
}
interface Match {
    user1: MatchUser;
    user2: MatchUser;
    matchEnded: boolean;
    isOriginalPong: boolean;
}

interface MatchUser extends User {
    score: number;
    isWinner: boolean;
}

interface ProfileUser extends User {
    wins: number,
    losses: number,
}

function Perfil() {

    const { username } = useParams();
    const [userProfile, setUserProfile] = useState<ProfileUser>();
    const [matches, setMatches] = useState<Match[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                if (!username) {
                    getUserProfile().then(userProf => {
                        navigate('/perfil/' + userProf.username);
                    });
                }
                else {
                    getUserMatches(username).then(async userProf => {
                        if (!userProf.data)
                            navigate('/homepage');
                        else {
                            setUserProfile(userProf.data.user);
                            const imageUrl = await getUserImage(userProf.data.user.avatarUri);
                            setUserProfile(prevUserProfile => prevUserProfile ? { ...prevUserProfile, avatarFile: imageUrl ?? undefined } : undefined);
                            const matchesWithImages = await Promise.all(userProf.data.matches.map(async (match: Match) => {
                                const imageUrl1 = await getUserImage(match.user1.avatarUri);
                                const imageUrl2 = await getUserImage(match.user2.avatarUri);
                                return {
                                    ...match,
                                    user1: { ...match.user1, avatarFile: imageUrl1 ?? '' },
                                    user2: { ...match.user2, avatarFile: imageUrl2 ?? '' },
                                };
                            }));
                            setMatches(matchesWithImages);
                        }
                    })
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserProfile();
    }, [username]);


    const ContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        minHeight: '100vh',
        marginRight: '200px'
    };

    const ProfileStyle: React.CSSProperties = {
        border: 'none',
        background: 'transparent',
        width: '16vw',
        height: '38vw',
        top: '100px',
        right: '0px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
    };

    const AvatarStyle: React.CSSProperties = {
        width: '8vw',
        height: '8vw',
        borderRadius: '50%',
        objectFit: 'cover',
        marginBottom: '1.5vw',
    };

    const NameStyle: React.CSSProperties = {
        fontFamily: 'Quantico',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '1.5vw',
        maxWidth: '90%',
    };

    const RankStyle: React.CSSProperties = {
        ...NameStyle,
        fontSize: '1.2vw',
        color: 'gold',
    };

    const WinLossContainerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%',
        fontSize: '1.0vw',
    }

    const WinStyle: React.CSSProperties = {
        ...NameStyle,
        color: 'green',
    }

    const LossStyle: React.CSSProperties = {
        ...NameStyle,
        color: 'red',
    }

    const HistoryMatchStyle: React.CSSProperties = {
        border: 'none',
        background: 'transparent',
        width: '40vw',
        height: '36vw',
        top: '100px',
        right: '150px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
    };

    const MatchStyle: React.CSSProperties = {
        border: '1px solid white',
        background: 'grey',
        width: '100%',
        height: '20%',
        margin: '0.5%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        padding: '0 3%'
    };
    const MatchImageStyle: React.CSSProperties = {
        width: '5vw',
        height: '5vw',
        objectFit: 'cover',
        borderRadius: '50%',
        marginLeft: '5%',
        marginRight: '5%'
    };

    const matchesStyle: React.CSSProperties = {
        fontFamily: 'Quantico',
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: '1vw',
        maxWidth: '75%',
        whiteSpace: 'nowrap',
    };

    const TitleStyle: React.CSSProperties = {
        fontFamily: "'Press Start 2P'",
        fontSize: '18px',
        color: 'lightgray'
    };

    return (
        <div style={ContainerStyle}>
            <HomeButton></HomeButton>
            <div style={ProfileStyle}>
                <img style={AvatarStyle} src={userProfile?.avatarFile} alt={`Profile of ${userProfile?.avatarFile}`} />
                <h1 style={NameStyle}>{userProfile?.nick}</h1>
                <h2 style={RankStyle}>Rank: #{userProfile?.rank}</h2>
                <div style={WinLossContainerStyle}>
                    <h3 style={WinStyle}>Wins: {userProfile?.wins}</h3>
                    <h3 style={LossStyle}>Losses: {userProfile?.losses}</h3>
                </div>
            </div>
            <div style={HistoryMatchStyle}>
                <p style={TitleStyle}>Partidas recientes</p>
                {matches && [...matches].slice(-5).reverse().map((match, index) => (
                    <div key={index} style={MatchStyle}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flex: '1' }}>
                            <Link to={`/perfil/${match.user1.nick}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'flex', alignItems: 'center' }}>
                                <img style={MatchImageStyle} src={match.user1.avatarFile} alt={`User: ${match.user1.nick}`} />
                                <p style={{ ...matchesStyle, marginLeft: '20px' }}>{match.user1.nick}</p>
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: '1', textAlign: 'center' }}>
                            {match.matchEnded
                                ? <p style={matchesStyle}>{match.user1.score} - {match.user2.score}</p>
                                : <button style={{ ...matchesStyle, border: 'none', color: 'white', background: '#5b8731' }}
                                    onClick={() => match.isOriginalPong ?
                                        navigate('/pong/spectate/' + userProfile?.userId)
                                        : navigate('/pong-alter/spectate/' + userProfile?.userId)}
                                >Ver partida</button>
                            }
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: '1' }}>
                            <Link to={`/perfil/${match.user2.nick}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <p style={{ ...matchesStyle, marginRight: '20px' }}>{match.user2.nick}</p>
                                <img style={MatchImageStyle} src={match.user2.avatarFile} alt={`Opponent: ${match.user2.nick}`} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <SocialMenu></SocialMenu>
        </div>
    );
}

export default Perfil;
