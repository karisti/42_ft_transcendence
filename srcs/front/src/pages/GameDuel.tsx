import React, { useEffect, useState } from 'react';
import HomeButton from "../components/B_Home";
import PlayButton from "../components/gameSelector/B_PlayFriends";
import SocialMenu from "../components/chat-friend-menu/SocialMenu";
import { getUsersList } from '../requests/Friend.Service';
import { getUserImage } from '../requests/User.Service';

interface Friend {
    id: number;
    nick: string;
    avatarUri: string;
    isOnline: boolean;
    isInGame: boolean;
    avatarFile?: string | null;
}

function GameFriends() {
    const [friendList, setFriendList] = useState<Friend[]>([]);
    const [isFriendHovered, setIsFriendHovered] = useState(-1);
    const [playWithUserId, setPlayWithUserId] = useState<number>(-1);
    const [isOriginal, setisOriginal] = useState(false);


    useEffect(() => {
        const fetchFriends = async () => {
            const friendsRequest = await getUsersList();
            const friendsWithImages = await Promise.all(friendsRequest.users.map(async (friend: { avatarUri: string; }) => {
                const imageUrl = await getUserImage(friend.avatarUri);
                return { ...friend, avatarFile: imageUrl };
            }));
            setFriendList(friendsWithImages);
        };

        fetchFriends();
    }, []);


    //<<< STYLES >>>//
    const MainContainer: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    }

    const Content: React.CSSProperties = {
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '300px',
        position: 'relative',
    }

    const Box: React.CSSProperties = {
        width: '940px',
        height: '620px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '15px',
        background: '#4C5970',
    }

    const ButtonHeader: React.CSSProperties = {
        width: '100%',
        height: '100px',
        display: 'flex',
    }

    const Button: React.CSSProperties = {
        width: '50%',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
        fontFamily: "'Press Start 2P'",
        color: 'white',
        background: isOriginal
            ? 'rgba(0,0,0,0.2)'
            : 'rgba(0,0,0,0)',
    }

    const ButtonAlt: React.CSSProperties = {
        width: '50%',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
        fontFamily: "'Press Start 2P'",
        color: 'white',
        background: isOriginal
            ? 'rgba(0,0,0,0)'
            : 'rgba(0,0,0,0.2)',
    }

    const SectionStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: '3%',
        marginLeft: '8%',
        width: '85%',
        paddingRight: '2%',
        maxHeight: '500px',
        overflowY: 'auto',
    };
    
    const friendContainerStyle: React.CSSProperties = {
        width: '130px',
        height: '120px',
        marginBottom: '3%',
        marginRight: '3%',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.3s ease-in-out, background-color 0.3s ease',
    };
    
    const avatarWrapperStyle: React.CSSProperties = {
        width: '100px',
        height: '130px',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out, background-color 0.8s ease',
    };
    
    const avatarStyle: React.CSSProperties = {
        width: '80px',
        height: '80px',
        marginTop: '25%',
        borderRadius: '50%',
    };
    
    const nameStyle: React.CSSProperties = {
        marginTop: '10px',
        fontSize: '20px',
        color: '#c0c0c0',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '10px',
        whiteSpace: 'nowrap',
    };


    //<<< FUNCTIONS >>>//
    const changeCustom = () => {
        if (isOriginal === true)
            setisOriginal(false);
    }

    const changeOriginal = () => {
        if (isOriginal === false)
            setisOriginal(true);
    }

    //<<< BUILD >>>//
    return (
        <div style={MainContainer}>
            <div style={Content}>
                <HomeButton></HomeButton>
                <div style={Box}>
                    <div className='ButtonHeader' style={ButtonHeader}>
                        <div className='OriginalButton' style={Button} onClick={changeCustom}>ORIGINAL</div>
                        <div className='CustomButton' style={ButtonAlt} onClick={changeOriginal}>ALTERNATIVO</div>
                    </div>
                    <div className='OriginalContent' style={SectionStyle}>
                        {friendList.map((friend, index) => (
                            <button
                                key={index}
                                style={friendContainerStyle}
                                onMouseEnter={() => {
                                    if (playWithUserId !== friend.id)
                                        setIsFriendHovered(index);
                                }}
                                onMouseLeave={() => setIsFriendHovered(-1)}
                                onClick={() => setPlayWithUserId(friend.id)}
                            >
                                <div style={{
                                    transform: (isFriendHovered === index && playWithUserId !== friend.id) ? 'scale(1.1)' : 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                }}>
                                    <div style={{...avatarWrapperStyle, backgroundColor: playWithUserId === friend.id ? '#5b8731' : 'transparent'}}>
                                        <img
                                            className='FriendAvatar'
                                            alt={'Avatar de' + friend.nick}
                                            src={friend.avatarFile || ''}
                                            style={avatarStyle}
                                        />
                                        <p style={nameStyle}>{friend.nick}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <PlayButton friendGameId={playWithUserId} gamemode={isOriginal}></PlayButton>
                    <div className='CustomContent'>
                    </div>
                </div>
            </div>
            <SocialMenu></SocialMenu>
        </div>
    );
}

export default GameFriends;
