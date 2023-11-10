import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatChannelCreateDto, ChatChannelUpdateDto } from "./dto";
import { UserService } from '../../user/user.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatGateway } from '../chat-socket/chat.gateway'
import * as argon from "argon2";
import { ChatBlockedUserService } from '../chat-blocked-user/chat-blocked-user.service';


@Injectable()
export class ChatChannelService {
	constructor(private prisma: PrismaService, private userService: UserService,
		private ws: ChatGateway, private chatBlockedUserService: ChatBlockedUserService) { }

	async getChannelChat(userId: number, channelId: number) {
		try {
			const channel = await this.getChannelChatInfo(userId, channelId);
			return this.formatChannel(channel);
		} catch (error) {
			ThrowHttpException(new NotFoundException, 'Ese canal no existe');
		}
		
	}
	
	async createChannel(userId: number, dto: ChatChannelCreateDto) {

		let hash: string = null;
		let isPrivate: boolean = false;

		const user = await this.userService.getUserById(userId);

		if (dto.password != null && dto.password.length > 0)
		{
			hash = await argon.hash(dto.password);
			isPrivate = true;
		}
		
		try {
			const newChannel = await this.prisma.chatChannel.create({
				data: {
					name: dto.name,
					isPrivate: isPrivate,
					hash: hash
				}
			});
			
			await this.joinChannelOwner(newChannel.id, user.id, true);

			this.ws.joinRoom(userId, "channel_" + String(newChannel.id));
			
			this.sendUpdatedChannelListToAllUsersWithSocket();

			delete newChannel.hash;
			return newChannel;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Ya existe un canal con este nombre');
			}
		}
	}

	async updateChannel(userId: number, dto: ChatChannelUpdateDto) {
		let hash: string = null;
		let isPrivate: boolean = false;

		const user = await this.userService.getUserById(userId);
		const channel = await this.getChannel(dto.id);

		await this.checkUserIsAuthorizedInChannnel(user.id, channel.id);

		if (dto.password != null && dto.password.length > 0)
		{
			hash = await argon.hash(dto.password);
			isPrivate = true;
		}

		try {
			const channel = await this.prisma.chatChannel.update({
				where: {
					id: dto.id
				},
				data: {
					name: dto.name,
					isPrivate: isPrivate,
					hash: hash
				}
			});

			this.sendUpdatedChannelListToAllUsersWithSocket();

			delete channel.hash;
			return channel;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Ya existe un canal con este nombre');
			}
		}
	}

	async deleteChannel(userId: number, dto: ChatChannelUpdateDto, isSiteAdmin: boolean = false) {
		const user = await this.userService.getUserById(userId);
		const channel = await this.getChannel(dto.id);

		if (!isSiteAdmin)
			await this.checkUserIsAuthorizedInChannnel(user.id, channel.id);

		await this.kickAllUsersFromChannelWithSocket(dto.id);

		try {
			await this.prisma.chatChannel.delete({
				where: {
					id: channel.id
				}
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Canal desconocido');
			}
		}

		this.sendUpdatedChannelListToAllUsersWithSocket();
		
		delete channel.hash;
		return channel;
	}

	async kickAllUsersFromChannelWithSocket(channelId: number) {
		this.ws.sendSocketMessageToRoom("channel_" + String(channelId), 'KICK_FROM_CHANNEL',
											{channelId: channelId});
	}

	async getChannel(channelId: number) {
		if (channelId == null)
			ThrowHttpException(new BadRequestException, 'You must provide channel id');

		const channel = await this.prisma.chatChannel.findUnique({
			where: {
				id: channelId,
			}
		});

		if (channel === null) {
			ThrowHttpException(new NotFoundException, 'Ese canal no existe');
		}

		return channel;
	}

	async getChannelByName(name: string) {
		if (!name)
			ThrowHttpException(new BadRequestException, 'You must provide channel name');

		const channel = await this.prisma.chatChannel.findFirst({
			where: {
				name: name,
			}
		});

		if (channel === null) {
			ThrowHttpException(new NotFoundException, 'Ese canal no existe');
		}

		return channel;
	}

	async checkUserIsAuthorizedInChannnel(userId: number, channelId: number) {

		try {
			const channelUser = await this.getChannelUser(channelId, userId);

			if (channelUser.isOwner || channelUser.isAdmin)
				return true;
			else {
				ThrowHttpException(new UnauthorizedException, 'Necesitas ser propietario o admin del canal para realizar esta acción');
			}
			
		} catch (error) {
			ThrowHttpException(new UnauthorizedException, 'Necesitas ser propietario o admin del canal para realizar esta acción');
		}
		
	}

	async getChannelUser(channel_id: number, user_id: number) {
		const channelUser = await this.prisma.chatChannelUser.findFirst({
			where: {
				channelId: channel_id,
				userId: user_id,
			}
		});

		if (channelUser == null)
			ThrowHttpException(new NotFoundException, 'El usuario no existe en el canal');

		return channelUser;
	}

	private async joinChannelOwner(channelId: number, userId: number, isOwner: boolean) {
		let isAdmin: boolean = false;

		if (isOwner)
			isAdmin = true;

		try {
			await this.prisma.chatChannelUser.create({
				data: {
					channelId: channelId,
					userId: userId,
					isOwner: isOwner,
					isAdmin: isAdmin
				}
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Ya estas dentro del canal');
			}
		}
	}

	async getBannedUser(channelId: number, userId: number)
	{
		let channelBannedUser = await this.prisma.chatChannelBannedUser.findFirst({
			where: {
				channelId: channelId,
				userId: userId,
			}
		});

		if (channelBannedUser)
			return channelBannedUser;
			
		try {
			channelBannedUser = await this.prisma.chatChannelBannedUser.create({
				data: {
					channelId: channelId,
					userId: userId
				}
			});
			return channelBannedUser;

		} catch (error) {
			return null;
		}
	}

	async isUserBanned(channelId: number, userId: number) {
		const channelBannedUser = await this.getBannedUser(channelId, userId);

		if (!channelBannedUser)
			return false;

		return channelBannedUser.isBanned;
	}

	async isUserMuted(channelId: number, userId: number) {
		const channelBannedUser = await this.getBannedUser(channelId, userId);

		if (!channelBannedUser)
			return false;

		let currentTime = new Date().getTime();
		let mutedUntil = new Date(channelBannedUser.isMutedUntil).getTime();

		if (mutedUntil > currentTime)
			return true;
		return false;
	}


	async getMyChannelsAndPublicChannels(userId: number) {
		const myChannels = await this.getMyChannels(userId);
		const myChannelsFormatted = this.formatChannelsList(myChannels, true);

		const myChannelsList = myChannels.map(channel => channel.id);

		const publicChannels = await this.getAllPublicChannels(myChannelsList);
		const publicChannelsFiltered = [];
		for (const channel of publicChannels) {
			if (!await this.isUserBanned(channel.id, userId)) {
				publicChannelsFiltered.push(channel);
			}
		}
		
		const publicChannelsFormatted = this.formatChannelsList(publicChannelsFiltered, false);

		const myChannelsAndPublicChannelsList = [...myChannelsFormatted, ...publicChannelsFormatted];

		return myChannelsAndPublicChannelsList;
	}

	async sendUpdatedChannelListToAllUsersWithSocket() {

		const allUsers = await this.prisma.user.findMany({
			include: {
				chatChannelUser: {
					include: {
						channel: true
					},
				}
			},
		});

		for (const user of allUsers) {
			this.ws.sendSocketMessageToUser(user.id, 'UPDATE_CHANNELS_LIST',
					await this.getMyChannelsAndPublicChannels(user.id));
		}
	}


	private async getMyChannels(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId, },
			include: {
				chatChannelUser: {
					include: {
						channel: true
					},
				}
			},
		});

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		const myChannels = user.chatChannelUser;
		const myChannelsList = myChannels.map(channel => channel.channel);

		return myChannelsList;
	}

	private async getChannelChatInfo(userId: number, channelId: number) {
		let channelChatInfo = await this.prisma.chatChannel.findFirst({
			where: {
				id: channelId
			},
			include: {
				chatChannelUser: {
					include: {
						user: true,
					},
				},
				chatChannelMessage: {
					include: {
						user: true
					}
				}
			}
		});

		if (!channelChatInfo)
			return {};

		/*
		Evitamos que el usuario reciba los mensajes de usuarios que tiene bloqueados
		*/
		const blockedUserIds: number[] = await this.chatBlockedUserService.getMyBlockedUsersIdList(userId);

		let newMessageList: any[] = [];
		for (const msg of channelChatInfo.chatChannelMessage) {
			if (!blockedUserIds.includes(msg.userId))
				newMessageList = [...newMessageList, msg];
		}

		channelChatInfo.chatChannelMessage = newMessageList;
		
		return channelChatInfo;
	}

	private async getAllPublicChannels(myChannels: number[]) {
		return await this.prisma.chatChannel.findMany({
			where: {
				NOT: {
					id: {
						in: myChannels
					},
				},
				isPrivate: false
			},
			include: {
				chatChannelUser: {
					include: {
						user: true
					}
				},
				chatChannelMessage: {
					include: {
						user: true
					}
				}
			}
		});
	}

	private formatChannel(channel) {
		const channelFormatted = {
			id: channel.id,
			name: channel.name,
			isPrivate: channel.isPrivate,
			createdAt: channel.createdAt,
			members: this.formatChannelUsers(channel.chatChannelUser),
			messages: this.formatChannelMessages(channel.chatChannelMessage)
		};

		return channelFormatted;
	}

	private formatChannelsList(channelsList: any, imInside: boolean) {
		const channelsListFormatted: any[] = channelsList.map((channel) => ({
			id: channel.id,
			name: channel.name,
			isPrivate: channel.isPrivate,
			imInside: imInside
		}));

		return channelsListFormatted;
	}

	private formatChannelUsers(userList: any) {
		const userListFormatted: any[] = userList.map((user) => ({
			id: user.user.id,
			nick: user.user.nick,
			avatarUri: user.user.avatarUri,
			isOnline: user.user.isOnline,
			isInGame: user.user.isInGame,
			joinedAt: user.joinedAt,
			isOwner: user.isOwner,
			isAdmin: user.isAdmin
		}));

		return userListFormatted;
	}

	private formatChannelMessages(messageList: any) {
		const messageListFormatted: any[] = messageList.map((msg) => ({
			userId: msg.user.id,
			sender: msg.user.nick,
			avatarUri: msg.user.avatarUri,
			sentAt: msg.sentAt,
			message: msg.message
		}));

		return messageListFormatted;
	}

	async getChannelUserList(channelId: number): Promise<number[]> {
		let channelChatInfo = await this.prisma.chatChannel.findFirst({
			where: {
				id: channelId
			},
			include: {
				chatChannelUser: {
					include: {
						user: true,
					},
				},
			}
		});

		const userIds = channelChatInfo.chatChannelUser.map((chatChannelUser) => chatChannelUser.user.id);

		return userIds;
	}

}
