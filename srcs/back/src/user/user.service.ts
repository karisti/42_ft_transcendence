import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { ThrowHttpException } from '../utils/error-handler';
import { EditUserByAdminDto, UserProfileDto, UserProfileUpdateDto } from "./dto";
import { ConfigService } from "@nestjs/config";
import { join } from 'path';
import * as fs from 'fs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserStateChangedEvent, SelfUserStateChangedEvent } from './user.events';
import { use } from 'passport';


@Injectable()
export class UserService {
	constructor(private prisma: PrismaService, private config: ConfigService,
				private eventEmitter: EventEmitter2) { }

	async getUserById(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			}
		});

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		delete user.hash;
		return user;
	}

	async getUserByNick(nick: string, select: any = {}) {

		let user;

		/*
			If 'select' is given, it can get only the necessary info.
			If not, returns full user.
		*/
		if (Object.keys(select).length === 0) {
			user = await this.prisma.user.findUnique({
				where: {
					nick: nick,
				}
			});
		} else {
			user = await this.prisma.user.findUnique({
				where: {
					nick: nick,
				},
				select: select
			});
		}

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		delete user.hash;
		return user;
	}

	async editUserBySiteAdmin(adminUser: any, dto: EditUserByAdminDto) {
		try {
			const user = await this.prisma.user.update({
				where: {
					nick: dto.nick
				},
				data: {
					...dto,
				},
				select: {
					id: true,
					nick: true,
					avatarUri: true,
					isOnline: true,
					isInGame: true,
					isSiteOwner: true,
					isSiteAdmin: true,
					isBanned: true,
				}
			});
			
			await this.updateStateToUser(user);
		}
		catch (error) {
			ThrowHttpException(new BadRequestException, 'Usuario no encontrado');
		}
	}

	/*
	 * Delete user and all its data (avatar, ...)
	*/
	async deleteUser(userId: number) {

		try {
			const user = await this.prisma.user.delete({
				where: {
					id: userId
				}
			});
			
			this.removeAvatar(user.avatarUri);
			
			delete user.hash;
			return user;
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Usuario no encontrado');
			}
		}
	}

	/*
	 * Get user profile data
	*/
	async getProfile(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				nick: true,
				avatarUri: true,
				isSiteOwner: true,
				isSiteAdmin: true
			}
		});
		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}
		
		return user;
	}

	/*
	 * Set / update user profile data and profile picture
	*/
	async updateProfileData(userId: number, dto: UserProfileUpdateDto, file?: Express.Multer.File) {
		let fileName = file?.filename;

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			}
		});

		if (user === null) {
			if (file)
			{
				this.removeAvatar(file.filename)
			}
			
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		const prevAvatar = user.avatarUri;
		
		if (!fileName)
		{
			fileName = prevAvatar;
		}

		try {
			const user = await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					nick: dto.nick,
					avatarUri: fileName
				},
			});

			await this.updateUserStateToAll(userId);

			if (prevAvatar && prevAvatar !== fileName)
			{
				this.removeAvatar(prevAvatar);
			}

			delete user.hash;
			return user;
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Nick is already taken');
			}
		}
	}

	/*
	 * Remove user profile picture
	*/
	async deleteProfilePicture(userId: number) {

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			}
		});

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		const avatar = user.avatarUri;

		try {
			const user = await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					avatarUri: this.config.get('DEFAULT_AVATAR')
				},
			});

			await this.updateUserStateToAll(userId);

			this.removeAvatar(avatar);

			delete user.hash;
			return user;
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Usuario no encontrado');
			}
		}
	}

	/*
	 * Remove avatar file
	*/
	private async removeAvatar(fileName: string) {
		if (fileName && fileName !== this.config.get('DEFAULT_AVATAR'))
		{
			fs.unlink(join(__dirname, '../../', this.config.get('PATH_AVATARS'), fileName), (err) => {});
		}
	}

	/*
	 * Set user status (online / offline)
	*/
	async setUserStatus(userId: number, isOnline: boolean): Promise<any> {
		try {
			let user: any = await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					isOnline: isOnline
				},
				select: {
					id: true,
					nick: true,
					avatarUri: true,
					isOnline: true,
					isInGame: true,
				}
			});

			return {
					userId: user.id,
					nick: user.nick,
					avatarUri: user.avatarUri,
					isOnline: user.isOnline,
					isInGame: user.isInGame,
				};
		}
		catch (error) {
			return (null);
		}
	}

	/*
	 * Set user status (ingame)
	*/
	async setUserInGame(userId: number, isInGame: boolean): Promise<any> {
		try {
			const user = await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					isInGame: isInGame
				},
			});

			await this.updateUserStateToAll(userId);
			
			delete user.hash;
			return user;
		}
		catch (error) {
			return (null);
		}
	}

	async getUserStatusFriendList(userId: number): Promise<any> {
		try {
			let user: any = await this.prisma.user.findFirst({
				where: {
					id: userId
				},
				select: {
					id: true,
					nick: true,
					avatarUri: true,
					isOnline: true,
					isInGame: true,
				}
			});

			return {
					userId: user.id,
					nick: user.nick,
					avatarUri: user.avatarUri,
					isOnline: user.isOnline,
					isInGame: user.isInGame,
				};
		}
		catch (error) {
			return (null);
		}
	}

	async getUserStatus(user: any): Promise<any> {
		try {
			return {
					userId: user.id,
					nick: user.nick,
					avatarUri: user.avatarUri,
					isOnline: user.isOnline,
					isInGame: user.isInGame,
					isSiteOwner: user.isSiteOwner,
					isSiteAdmin: user.isSiteAdmin,
					isBanned: user.isBanned
				};
		}
		catch (error) {
			return (null);
		}
	}

	async doesUserExit(userId: number): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			}
		});
		
		if (user === null) {
			return false;
		}
		
		return true;
	}

	async getUserByLogin(login: string): Promise<any> {
		const user = await this.prisma.user.findUnique({
			where: {
				login: login,
			}
		});

		if (user != null)
			delete user.hash;

		return user;
	}

	async getUserAndChatsById(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			include: {
				chatDirectUser1: {
					select: {
						id: true
					}
				},
				chatDirectUser2: {
					select: {
						id: true
					}
				},
				chatChannelUser: {
					select: {
						channelId: true
					}
				}
			}
		});

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		delete user.hash;
		return user;
	}

	public async updateUserStateToAll(userId: number): Promise<void> {
		const user = await this.getUserStatusFriendList(userId);

		if (user)
			this.eventEmitter.emit(UserStateChangedEvent.name, new UserStateChangedEvent(user));
	}

	public async updateStateToUser(userId: any): Promise<void> {
		const user = await this.getUserStatus(userId);
		
		if (user)
			this.eventEmitter.emit(SelfUserStateChangedEvent.name, new SelfUserStateChangedEvent(user));
	}

	public async updateGameStats(userId: number, hasWon: boolean) {

		try {
			if (hasWon) {
				await this.prisma.user.update({
					where: {
						id: userId
					},
					data: {
						gamesWon: { increment: 1 },
						gamesPlayed: { increment: 1 }
					},
				});
			} else {
				await this.prisma.user.update({
					where: {
						id: userId
					},
					data: {
						gamesLost: { increment: 1 },
						gamesPlayed: { increment: 1 }
					},
				});
			}
		} catch (error) {
		}
		
		
	}

	public async getGameRanking() {
		try {
			const users = await this.prisma.user.findMany({
				where: {
					NOT: {
						gamesPlayed: 0
					}
				},
				select: {
					id: true,
					nick: true,
					avatarUri: true,
					gamesWon: true,
					gamesLost: true,
					gamesPlayed: true
				}
			});

			if (!users || users.length == 0)
				return [];
			
			const usersWithRatio = users.map(user => ({
				...user,
				ratio: user.gamesWon / user.gamesLost,
			}));
		
			let gameRankingUsers = usersWithRatio;
			if (users.length > 1) {
				gameRankingUsers = usersWithRatio.sort((a, b) => b.ratio - a.ratio);
			}
			const gameRankingUsersFormatted = this.formatGameRankingUsers(gameRankingUsers);
			return gameRankingUsersFormatted; 

		} catch (error) {
			return [];
		}
		
	}

	private formatGameRankingUsers(gameRankingUsers: any) {
		const gameRankingUsersFormatted: any[] = gameRankingUsers.map((userRank, index) => ({
			userId: userRank.id,
			nick: userRank.nick,
			avatarUri: userRank.avatarUri,
			wins: userRank.gamesWon,
			losses: userRank.gamesLost,
			played: userRank.gamesPlayed,
			rank: index + 1
		}));

		return gameRankingUsersFormatted;
	}

	async getAllUsers(userId: number) {
		const users = await this.prisma.user.findMany({
			where: {
				NOT: {
				  id: userId
				}
			},
			select: {
				id: true,
				nick: true,
				avatarUri: true
			}
		});
		
		if (!users)
			return [];

		return users;
	}
}

