import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, deleteAvatarProfile } from '../../requests/User.Service';

interface Args {
	btnTxt: string
}


const UserSettingsButtons: React.FC<Args> = (args) => {
	const [username, setUsername] = useState('');
	const [image, setImage] = useState<File | null>(null);
	const [userImage, setUserImage] = useState<string>();
	const [isNickInvalid, setNickInvalid] = useState<boolean>(false);
	const [isImageInvalid, setImageInvalid] = useState<boolean>(false);
	const navigate = useNavigate();
	
	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};
	
	
	function isImageFile(fileBytes: { [x: string]: any; }) {
		const pngMagicBytes = [0x89, 0x50, 0x4E, 0x47];
		const jpegMagicBytes = [0xFF, 0xD8, 0xFF, 0xE0];
	  
		return (
		  compareMagicBytes(fileBytes, pngMagicBytes) ||
		  compareMagicBytes(fileBytes, jpegMagicBytes)
		);
	  }
	
	function compareMagicBytes(fileBytes: { [x: string]: any; }, magicBytes: any[]) {
		return magicBytes.every((byte: any, index: string | number) => fileBytes[index] === byte);
	}

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		
		if (event.target.files && event.target.files.length > 0) {
			const selectedImage = event.target.files[0];
			const reader = new FileReader();

			reader.onloadend = () => {
				if (reader.result instanceof ArrayBuffer) {
					const bytes = new Uint8Array(reader.result);
			
					if (isImageFile(bytes)) {
						setImage(selectedImage);
						const imageURL = URL.createObjectURL(selectedImage);
						setUserImage(imageURL);
					} else {
						console.log('Tipo de archivo no permitido. Por favor, selecciona una imagen válida (PNG, JPG o JPEG).');
						setImageInvalid(true);  // Mover setImageInvalid aquí
						setTimeout(() => setImageInvalid(false), 1000);
					}
				}
			};
			reader.readAsArrayBuffer(selectedImage);
		}
	};


	const handleImageMouseEnter = () => {
		setImageStyle({ ...ImageStyle, opacity: 0.5 });
	};

	const handleImageMouseLeave = () => {
		setImageStyle({ ...ImageStyle, opacity: 1 });
	};

	const handleApplyButtonMouseEnter = () => {
		setApplyButtonStyle({ ...ApplyButtonStyle, opacity: 0.7 });
	};

	const handleApplyButtonMouseLeave = () => {
		setApplyButtonStyle({ ...ApplyButtonStyle, opacity: 1 });
	};

	const handleTrashMouseEnter = () => {
		setTrashIconStyle({ ...TrashIconStyle, opacity: 0.75 });
	};

	const handleTrashMouseLeave = () => {
		setTrashIconStyle({ ...TrashIconStyle, opacity: 1 });
	};

	// ---------------------- INTERACTIONS -------------------------------

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
	  
		const success = await updateUserProfile(username, image);
	  
		if (success)
		  navigate('/homepage');
		else {
			setNickInvalid(true);
			setTimeout(() => setNickInvalid(false), 1000);
		}
	};

	const resetAvatar = async (event: React.FormEvent) => {
		event.preventDefault();

		const imageURL = await deleteAvatarProfile();
  
		if (imageURL) {
		  setUserImage(imageURL);
		}
	};

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const userProfile = await getUserProfile();
				setUsername(userProfile.username);
				setUserImage(userProfile.userImage);
			} catch (error) {
				navigate('/');
			}
		  };
		  
		   fetchUserProfile();
	}, []);

	// -------------------------- STYLES ---------------------------------

	const UsernameStyle: React.CSSProperties = {
		color: '#ffffff',
		fontFamily: "'Press Start 2P'",
		fontSize: '14px',
		fontWeight: 400,
		lineHeight: 'normal',
		position: 'relative',
		top: '42%',
		width: '0%',
		left: '5%',
	};

	const InputTextStyle: React.CSSProperties = {
		color: 'white',
		fontFamily: "'Press Start 2P'",
		fontSize: '12px',
		height: '5%',
		left: '33%',
		top: '36%',
		width: '52%',
		position: 'relative',
		border: 'none',
		borderBottom: isNickInvalid ? '2px solid red' : '2px solid gray',
		background: 'transparent',
		transition: 'border-color 0.5s ease',
	};

	const SelectImageStyle: React.CSSProperties = {
		height: '175px',
		width: '175px',
		position: 'absolute',
		top: '16%',
		left: '18%',
		borderRadius: '50%',
	};

	const ButtonStyle: React.CSSProperties = {
		height: '100%',
		width: '100%',
		position: 'absolute',
		top: '0',
		left: '-10px',
		borderRadius: '50%',
		opacity: 0,
	};

	const [ImageStyle, setImageStyle] = useState<React.CSSProperties>({
		height: '100%',
		width: '100%',
		position: 'relative',
		top: '0',
		left: '-10px',
		borderRadius: '50%',
		transition: 'opacity 0.3s',
		cursor: 'pointer',
	});

	const [TrashIconStyle, setTrashIconStyle] = useState<React.CSSProperties>({
		color: '#bf2222',
		top: '80%',
		left: '43%',
		position: 'relative',
		background: 'transparent',
		scale: '2.0',
		border: 'none',
		borderRadius: '50%',
		transition: 'opacity 0.3s',
		cursor: 'pointer',
	});

	const [ApplyButtonStyle, setApplyButtonStyle] = useState<React.CSSProperties>({
		backgroundColor: '#5b8731',
		color: '#FFFFFF',
		fontFamily: "'Press Start 2P'",
		fontSize: '16px',
		fontWeight: 'bold',
		border: 'none',
		borderRadius: '4px',
		padding: '10px 20px',
		cursor: 'pointer',
		width: '250px',
		marginTop: '46%',
		marginLeft: '35%',
		transition: 'opacity 0.3s',
	});

	const ImageWrapperStyle: React.CSSProperties = {
		height: '100%',
		width: '35%',
		left: '0%',
		position: 'absolute',
	};

	const TextWrapperStyle: React.CSSProperties = {
		height: '100%',
		width: '65%',
		left: '35%',
		position: 'absolute',
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<div style={TextWrapperStyle}>
					<div style={UsernameStyle}>
						Nickname:
					</div>
					<input
						type="text"
						value={username}
						style={InputTextStyle}
						placeholder='Nick'
						onChange={handleUsernameChange}
					/>
					<button
						type="submit"
						style={ApplyButtonStyle}
						onMouseEnter={handleApplyButtonMouseEnter}
						onMouseLeave={handleApplyButtonMouseLeave}
					>
						{args.btnTxt}
					</button>
				</div>
				<div style={ImageWrapperStyle}>
					<button type="button"
						onClick={resetAvatar}
						style={TrashIconStyle}
						onMouseEnter={handleTrashMouseEnter}
						onMouseLeave={handleTrashMouseLeave}
					>
						<FaTrash />
					</button>
					<label htmlFor="image" style={SelectImageStyle}>
						<input
							type="file"
							id="image"
							accept=".jpg,.png,.jpeg"
							onChange={handleImageChange}
							style={ButtonStyle}
						/>
						<img
							src={userImage}
							alt=""
							style={{...ImageStyle, border: isImageInvalid ? '2px solid red' : 'none '}}
							onMouseEnter={handleImageMouseEnter}
							onMouseLeave={handleImageMouseLeave}
						/>
					</label>
				</div>
			</form>
		</div>
	);
};

export default UserSettingsButtons;


