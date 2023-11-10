import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import { ChatBlockedUserService } from '../chat-blocked-user/chat-blocked-user.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatDirectMessageDto } from './dto';
import { ChatGateway } from '../chat-socket/chat.gateway';
import { ChatCommandsService } from '../chat-commands/chat-commands.service';


@Injectable()
export class ChatDirectMessageService {

	constructor(private prisma: PrismaService, private userService: UserService,
				private chatBlockedUserService: ChatBlockedUserService,
				private chatCommandsService: ChatCommandsService,
				private ws: ChatGateway) { }

	async sendDirectMessage(userId: number, dto: ChatDirectMessageDto) {
		const user1 = await this.userService.getUserById(userId);
		const user2 = await this.userService.getUserById(dto.user_id);

		const directChat = await this.getDirectChatByUserIds(user1.id, user2.id);
		
		if (!directChat)
			ThrowHttpException(new BadRequestException, 'Some error occurred creating direct chat.');

		if (await this.chatBlockedUserService.isUserBlocked(user1.id, user2.id))
			ThrowHttpException(new BadRequestException, 'You cant send a message to blocked users.');

		if (await this.chatBlockedUserService.isUserBlocked(user2.id, user1.id))
			ThrowHttpException(new BadRequestException, 'You cant send a message, you are blocked by the other user.');

			const response: any = await this.chatCommandsService.executeCommand(userId, {isDirect: true, chat_id: directChat.id, message: dto.message});
			if (response.commandExecuted == true)
			{
				delete response.commandExecuted;
				return response;
			}
		
		try {
			const newMessage = await this.prisma.chatDirectMessage.create({
				data: {
					directId: directChat.id,
					userId: user1.id,
					message: dto.message
				}
			});

			this.ws.sendSocketMessageToUser(user1.id, 'NEW_DIRECT_MESSAGE', {
				directId: user2.id,
				userId: user1.id,
				sender: user1.nick,
				avatarUri: user1.avatarUri,
				sentAt: newMessage.sentAt,
				message: newMessage.message,
			});

			this.ws.sendSocketMessageToUser(user2.id, 'NEW_DIRECT_MESSAGE', {
				directId: user1.id,
				userId: user1.id,
				sender: user1.nick,
				avatarUri: user1.avatarUri,
				sentAt: newMessage.sentAt,
				message: newMessage.message,
			})

			return newMessage;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Error sending direct message');
			}
		}
	}

	async getDirectChat(userId: number, otherUserId: number) {
		const directChat = await this.getDirectChatByUserIds(userId, otherUserId);

		return await this.getDirectChatAndMessages(directChat.id);
	}



	/*
	 * Private methods
	*/
	private async getDirectChatByUserIds(userId1: number, userId2: number) {
		let directChat = await this.prisma.chatDirect.findFirst({
			where: {
				userId1: userId1,
				userId2: userId2,
			}
		});

		if (directChat)
			return directChat;

		directChat = await this.prisma.chatDirect.findFirst({
				where: {
					userId1: userId2,
					userId2: userId1,
				}
			});
	
		if (directChat)
			return directChat;
			
		try {
			directChat = await this.prisma.chatDirect.create({
				data: {
					userId1: userId1,
					userId2: userId2,
				}
			});

			this.ws.joinRoom(userId1, "direct_" + String(directChat.id));
			this.ws.joinRoom(userId2, "direct_" + String(directChat.id));


			return directChat;

		} catch (error) {
			ThrowHttpException(new NotFoundException, 'Error creating direct chat.');
		}
	}

	private async getDirectChatAndMessages(chatId: number) {
		let directChat = await this.prisma.chatDirect.findUnique({
			where: { id: chatId },
			include: {
			  chatDirectMessageDirect: {
				include: {
				  user: {
					select: {
						id: true,
						nick: true,
						avatarUri: true
					}
				  },
				}
			  },
			  user1: {
				select: {
					id: true,
					nick: true,
					avatarUri: true,
				}
			  },
			  user2: {
				select: {
					id: true,
					nick: true,
					avatarUri: true,
				}
			  }
			}
		  });

		if (directChat == null) {
			ThrowHttpException(new NotFoundException, 'Direct chat not found');
		}

		// Reestructuración de los datos para coincidir con el formato de JSON deseado
		let messages = directChat.chatDirectMessageDirect.map(message => {
			return {
				userId: message.user.id,
				sender: message.user.nick,
				avatarUri: message.user.avatarUri,
				sentAt: message.sentAt,
				message: message.message,
			}
		});
		
		let members = [];
		members.push(directChat.user1);
		members.push(directChat.user2);

		let chatDirectInfo = {
			chatId: directChat.id,
			members: members,
			messages: messages
		}

		return chatDirectInfo;
	}
	
}
