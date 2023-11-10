import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import { ChatChannelService } from '../chat-channel/chat-channel.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatChannelMessageDto } from './dto'
import { ChatGateway } from '../chat-socket/chat.gateway';
import { ChatCommandsService } from '../chat-commands/chat-commands.service';
import { ChatBlockedUserService } from '../chat-blocked-user/chat-blocked-user.service';


@Injectable()
export class ChatChannelMessageService {

	constructor(private prisma: PrismaService, private userService: UserService,
				private chatChannelService: ChatChannelService, private ws: ChatGateway,
				private chatCommandsService: ChatCommandsService,
				private chatBlockedUserService: ChatBlockedUserService) { }

	async sendChannelMessage(userId: number, dto: ChatChannelMessageDto) {
		const user = await this.userService.getUserById(userId);
		const channel = await this.chatChannelService.getChannel(dto.channel_id);

		await this.chatChannelService.getChannelUser(channel.id, user.id);

		if (await this.chatChannelService.isUserBanned(channel.id, user.id))
			ThrowHttpException(new UnauthorizedException, 'No puedes mandar mensajes, estas bloqueado del canal');


		const response: any = await this.chatCommandsService.executeCommand(userId, {isDirect: false, chat_id: dto.channel_id, message: dto.message});
		if (response.commandExecuted == true)
		{
			delete response.commandExecuted;
			return response;
		}


		if (await this.chatChannelService.isUserMuted(channel.id, user.id))
			ThrowHttpException(new UnauthorizedException, 'No puedes mandar mensajes, estas silenciado del canal');


		try {
			const newMessage = await this.prisma.chatChannelMessage.create({
				data: {
					channelId: dto.channel_id,
					userId: user.id,
					message: dto.message
				}
			});

			/*
				Mandar socket (solo a usuarios del canal que no le tengan bloqueado)
				- Obtener lista de userIds del canal
				- Comprobar uno a uno si tienen bloqueado al sender
				- Si no lo tienen, mandar socket
			*/
			const channelUserIds: number[] = await this.chatChannelService.getChannelUserList(dto.channel_id);

			for (const userId of channelUserIds) {
				const blockedUserIds: number[] = await this.chatBlockedUserService.getMyBlockedUsersIdList(userId);
				if (!blockedUserIds.includes(user.id)) {
					this.ws.sendSocketMessageToUser(userId, 'NEW_CHANNEL_MESSAGE', {
						channelId: channel.id,
						userId: user.id,
						sender: user.nick,
						avatarUri: user.avatarUri,
						sentAt: newMessage.sentAt,
						message: newMessage.message,
					});
				}
			}

			this.ws.sendSocketMessageToRoom("admin_" + channel.name, "NEW_ADMIN_CHANNEL_MESSAGE", {
				channelId: channel.id,
				userId: user.id,
				sender: user.nick,
				avatarUri: user.avatarUri,
				sentAt: newMessage.sentAt,
				message: newMessage.message,
			});
			
			return newMessage;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Error al mandar el mensaje');
			}
		}
	}



	/*
	 * Private methods
	*/

	
}
