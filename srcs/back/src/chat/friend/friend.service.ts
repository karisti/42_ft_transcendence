import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { FriendDto } from "./dto";
import { UserService } from '../../user/user.service';
import { ChatGateway } from '../chat-socket/chat.gateway';


@Injectable()
export class FriendService {
	constructor(private prisma: PrismaService, private userService: UserService, private ws: ChatGateway) { }

	async addFriend(userId: number, dto: FriendDto) {
		const user = await this.userService.getUserById(userId);
		const friend = await this.userService.getUserByNick(dto.nick);

		if (user.id == friend.id)
			ThrowHttpException(new BadRequestException, 'You are already your friend! :)');

		/*
			Check if user is blocked to avoid sending friend request
		*/
		let blockedUser = await this.prisma.chatBlockedUser.findFirst({
			where: {
				userId: friend.id,
				otherUserId: user.id
			}
		});

		if (blockedUser != null)
			ThrowHttpException(new BadRequestException, 'Estás bloqueado');

		try {
			const otherFriendship = await this.getFriendship(friend.id, user.id);
			await this.updateFriendship(otherFriendship.id, {accepted: true});
			await this.createFriendship(user.id, friend.id, true);
		} catch (error) {
			// Friendship doesnt exist
			await this.createFriendship(user.id, friend.id, false);

			this.ws.sendSocketMessageToUser(friend.id, 'FRIEND_REQUEST_NEW', 
				await this.getFriendsFiltered(friend.id, false));
		}

		const friends = this.getFriendsFiltered(userId, true);
		return friends;
	}

	async acceptFriend(userId: number, dto: FriendDto) {
		const user = await this.userService.getUserById(userId);
		const friend = await this.userService.getUserByNick(dto.nick);

		const friendship = await this.getFriendship(friend.id, user.id);
		await this.updateFriendship(friendship.id, {accepted: true});
		await this.createFriendship(user.id, friend.id, true);

		this.ws.sendSocketMessageToUser(user.id, 'FRIEND_REQUEST_ACCEPTED', {
			friends: await this.getFriendsFiltered(user.id, true),
			friend_requests: await this.getFriendsFiltered(user.id, false),
		});

		this.ws.sendSocketMessageToUser(friend.id, 'FRIEND_REQUEST_ACCEPTED', {
			friends: await this.getFriendsFiltered(friend.id, true),
			friend_requests: await this.getFriendsFiltered(friend.id, false),
		});

		const friends = this.getFriendsFiltered(userId, true);
		return friends;
	}

	async getFriends(userId: number) {
		const friendList = await this.getFriendsFiltered(userId, true);

		return friendList;
	}
	
	async getFriendRequests(userId: number) {
		const friendList = await this.getFriendsFiltered(userId, false);
		
		return friendList;
	}

	async deleteFriend(userId: number, dto: FriendDto) {
		const user = await this.userService.getUserById(userId);
		const friend = await this.userService.getUserByNick(dto.nick);

		await this.deleteFriendship(user.id, friend.id);
		await this.deleteFriendship(friend.id, user.id);

		const friends = await this.getFriendsFiltered(userId, false);

		this.ws.sendSocketMessageToUser(user.id, 'FRIEND_REQUEST_REJECTED', friends);
		this.ws.sendSocketMessageToUser(friend.id, 'FRIEND_REQUEST_REJECTED', 
				await this.getFriendsFiltered(friend.id, false));

		return friends;
	}

	/*
	Private methods
	*/
	private async createFriendship(userId1: number, userId2: number, accepted: boolean) {
		try {
			const addedFriend = await this.prisma.friend.create({
				data: {
					userId: userId1,
					friend_userId: userId2,
					accepted: accepted
				}
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				// https://www.prisma.io/docs/reference/api-reference/error-reference
				// P2025 Record not found
				ThrowHttpException(error, 'Friendship already exists');
			}
		}
	}

	private async updateFriendship(friendshipId: number, data: any) {
		try {
			await this.prisma.friend.update({
				where: {
					id: friendshipId
				},
				data: data
			});
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Friend relationship not found');
			}
		}
	}

	private async getFriendship(userId1, userId2) {
		const friendship = await this.prisma.friend.findFirst({
			where: { userId: userId1, friend_userId: userId2 },
		});

		if (friendship === null) {
			ThrowHttpException(new NotFoundException, 'Friend relationship not found');
		}

		return friendship;
	}

	private async getFriendsFiltered(userId: number, accepted: boolean) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId, },
			include: {
				friendsUserFriends: {
					include: {
						user: true
					},
					where: {
						accepted: accepted
					}
				} 
			},
		});

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		const friends = user.friendsUserFriends;

		const friendListOnline: {userId: number, nick: string, avatarUri: string, isOnline: boolean, isInGame: boolean }[] = friends.filter(friend => friend.user.isOnline).map((friend) => ({
			userId: friend.user.id,
			nick: friend.user.nick,
			avatarUri: friend.user.avatarUri,
			isOnline: friend.user.isOnline,
			isInGame: friend.user.isInGame,
		}));

		const friendListOffline: {userId: number, nick: string, avatarUri: string, isOnline: boolean, isInGame: boolean }[] = friends.filter(friend => !friend.user.isOnline).map((friend) => ({
			userId: friend.user.id,
			nick: friend.user.nick,
			avatarUri: friend.user.avatarUri,
			isOnline: friend.user.isOnline,
			isInGame: friend.user.isInGame,
		}));

		const friendList = [...friendListOnline, ...friendListOffline];

		return friendList;
	}

	async deleteFriendship(userId1: number, userId2: number) {
		const friendship = await this.prisma.friend.findFirst({
			where: { userId: userId1, friend_userId: userId2 },
		});

		if (friendship === null)
			return ;

		await this.prisma.friend.delete({
			where: {
				id: friendship.id
			}
		});
	}
}
