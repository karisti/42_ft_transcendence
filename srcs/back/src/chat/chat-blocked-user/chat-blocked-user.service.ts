import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatBlockedDto } from './dto'
import { FriendService } from '../friend/friend.service';
import { ChatGateway } from '../chat-socket/chat.gateway';

@Injectable()
export class ChatBlockedUserService {

	constructor(private prisma: PrismaService, private userService: UserService, private friendService: FriendService,
				private ws: ChatGateway) { }

	async chatBlockUser(userId: number, dto: ChatBlockedDto) {
		const me = await this.userService.getUserById(userId);
		const otherUser = await this.userService.getUserByNick(dto.nick);

		if (me.id == otherUser.id)
			ThrowHttpException(new BadRequestException, 'No puedes bloquearte / desbloquearte a ti mismo');

		try {
			const blockedUser = await this.prisma.chatBlockedUser.create({
				data: {
					userId: me.id,
					otherUserId: otherUser.id
				}
			});

			await this.friendService.deleteFriendship(me.id, otherUser.id);
			await this.friendService.deleteFriendship(otherUser.id, me.id);

			this.ws.sendSocketMessageToUser(otherUser.id, 'UPDATE_FRIEND_LIST', await this.friendService.getFriends(otherUser.id));

			return blockedUser;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Ya has bloqueado a este usuario');
			}
		}
	}

	async chatUnblockUser(userId: number, dto: ChatBlockedDto) {
		const me = await this.userService.getUserById(userId);
		const otherUser = await this.userService.getUserByNick(dto.nick);

		if (me.id == otherUser.id)
			ThrowHttpException(new BadRequestException, 'No puedes bloquearte / desbloquearte a ti mismo');

		let blockedUser = await this.prisma.chatBlockedUser.findFirst({
			where: {
				userId: me.id,
				otherUserId: otherUser.id
			}
		});

		if (!blockedUser)
			ThrowHttpException(new NotFoundException, 'No se ha podido bloquear al usuario');

		await this.prisma.chatBlockedUser.delete({
			where: {
				id: blockedUser.id
			}
		});

		this.ws.sendSocketMessageToUser(userId, 'UPDATE_BLOCKED_LIST', await this.getMyBlockedUsersList(userId));

		return blockedUser;
	}

	async isUserBlocked(userId1: number, userId2: number): Promise<boolean> {
		let blockedUser = await this.prisma.chatBlockedUser.findFirst({
			where: {
				userId: userId1,
				otherUserId: userId2
			}
		});

		if (!blockedUser)
			return false;
		return true;
	}

	async getMyBlockedUsersList(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId, },
			include: {
				chatBlockedUser: {
					include: {
						otherUser: true
					},
				} 
			},
		});

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		const blockedUsers = user.chatBlockedUser;

		const blockedUsersList: { nick: string, avatarUri: string, }[] = blockedUsers.map((blockedUser) => ({
			nick: blockedUser.otherUser.nick,
			avatarUri: blockedUser.otherUser.avatarUri,
		}));

		return blockedUsersList;
	}

	async getMyBlockedUsersIdList(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId, },
			include: {
				chatBlockedUser: {
					include: {
						otherUser: {
							select: {
								id: true
							}
						}
					},
				} 
			},
		});

		if (user === null) {
			return [];
		}

		const blockedUsersList: number[] = user.chatBlockedUser.map(
			(blockedUser) => blockedUser.otherUser.id,
		);

		return blockedUsersList;
	}
}
