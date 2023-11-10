import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import { ChatChannelService } from '../chat-channel/chat-channel.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from "argon2";
import { ChatChannelJoinDto, ChatChannelLeaveDto, ChatChannelUserDto } from './dto';
import { ChatGateway } from '../chat-socket/chat.gateway';

@Injectable()
export class ChatChannelUserService {

	constructor(private prisma: PrismaService, private userService: UserService,
				private chatChannelService: ChatChannelService, private ws: ChatGateway) { }

	async joinChannel(userId: number, dto: ChatChannelJoinDto) {
		const user = await this.userService.getUserById(userId);
		const channel = await this.chatChannelService.getChannelByName(dto.name);

		if (await this.chatChannelService.isUserBanned(channel.id, user.id))
			ThrowHttpException(new UnauthorizedException, 'Estás baneado del canal, no puedes entrar');

		if (channel.isPrivate == true)
			await this.checkChannelPassword(channel.hash, dto.password);

		try {
			const newChannelUser = await this.prisma.chatChannelUser.create({
				data: {
					channelId: channel.id,
					userId: user.id
				}
			});

			this.ws.joinRoom(userId, "channel_" + String(channel.id));

			this.ws.sendSocketMessageToUser(user.id, 'UPDATE_CHANNELS_LIST',
					await this.chatChannelService.getMyChannelsAndPublicChannels(user.id));
			await this.sendUpdatedUserListToAllUsersWithSocket(channel.id, 'JOIN');

			return newChannelUser;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'You are already on this channel');
			}
		}
	}

	async leaveChannel(userId: number, dto: ChatChannelLeaveDto) {
		const user = await this.userService.getUserById(userId);
		const channel = await this.chatChannelService.getChannel(dto.id);

		try {
			const channelUser = await this.chatChannelService.getChannelUser(channel.id, user.id);
			
			await this.prisma.chatChannelUser.delete({
				where: {
					id: channelUser.id
				}
			});
			await this.sendUpdatedUserListToAllUsersWithSocket(channel.id, 'LEAVE');
			this.ws.leaveRoom(userId, "channel_" + String(channel.id));

			return channelUser;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Unknown error deleting channel user');
			}
		}
	}

	async updateChannelUser(userId: number, dto: ChatChannelUserDto, isSiteAdmin: boolean = false) {
		
			const user = await this.userService.getUserById(userId);
			const channel = await this.chatChannelService.getChannel(dto.id);
			const otherUser = await this.userService.getUserByNick(dto.nick);

			if (!isSiteAdmin)
				await this.chatChannelService.checkUserIsAuthorizedInChannnel(user.id, channel.id);

			const channelUser = await this.chatChannelService.getChannelUser(channel.id, otherUser.id);

			if (user.id == otherUser.id)
				ThrowHttpException(new BadRequestException, 'No puedes hacerte / quitarte admin del canal a ti mismo');

			try {
				const channelUserUpdated = await this.prisma.chatChannelUser.update({
					where: {
						id: channelUser.id
					},
					data: {
						isOwner: dto.isOwner,
						isAdmin: dto.isAdmin
					}
				});

				return channelUserUpdated;
			} catch (error) {
				ThrowHttpException(error, 'Unknown error updating channel user');
			}
	}

	async deleteChannelUser(userId: number, dto: ChatChannelUserDto) {
		const user = await this.userService.getUserById(userId);
		const channel = await this.chatChannelService.getChannel(dto.id);
		const otherUser = await this.userService.getUserByNick(dto.nick);

		await this.chatChannelService.checkUserIsAuthorizedInChannnel(user.id, channel.id);

		/* TODO: No permitir borrar a owner de canales. Admins solo los puede borrar el owner?
		if (otherUser.isSiteOwner)
			ThrowHttpException(new UnauthorizedException, 'No tienes permiso borrar al propietario del sitio de un canal');
		*/

		await this.leaveChannel(otherUser.id, {id: channel.id});
	}

	async sendUpdatedUserListToAllUsersWithSocket(channelId: number, event: string) {

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

		if (!channelChatInfo)
			return ;

		this.ws.sendSocketMessageToRoom("channel_" + String(channelId), 'UPDATE_CHANNEL_USERS_LIST_' + event,
				this.formatChannelUsers(channelChatInfo.chatChannelUser));
	}



	/*
	 * Private methods
	*/
	private async checkChannelPassword(channelHash: string, dtoPassword: string) {
		if (dtoPassword == null)
			ThrowHttpException(new BadRequestException, 'You must provide a correct password');

		const passwordMatches = await argon.verify(channelHash, dtoPassword);
		if (!passwordMatches)
			ThrowHttpException(new BadRequestException, 'You must provide a correct password');
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
	
}
