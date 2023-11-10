import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PongGameMatchDto, PongGameMatchCreateDto, PongGameMatchUpdateDto, PongDuelDto } from './dto';
import { ChatGateway } from '../../chat/chat-socket/chat.gateway';

@Injectable()
export class PongGameMatchService {

	constructor(private prisma: PrismaService, private userService: UserService, private ws: ChatGateway) { }

	async createNewMatch(dto: PongGameMatchCreateDto) {
		const user1 = await this.userService.getUserById(dto.userId1);
		const user2 = await this.userService.getUserById(dto.userId2);

		try {
			const gameMatch: PongGameMatchDto = await this.prisma.gameMatch.create({
				data: {
					userId1: user1.id,
					userId2: user2.id,
					isOriginalPong: dto.isOriginalPong
				},
			});

			return gameMatch;
		} catch (error) {
			return null;
		}
	}

	async updateMatchInfo(dto: PongGameMatchUpdateDto) {
		await this.prisma.gameMatch.update({
			where: { id: dto.matchId },
			data: {
				hasEnded: dto.hasEnded,
				score1: dto.score1,
				score2: dto.score2,
				winnerUserId: dto.winnerUserId
			},
		});
	}

	async getGameRanking(userId: number) {

		const ranking = await this.userService.getGameRanking();

		return ranking;
	}

	async getProfileMatches(userId: number, nick: string) {

		const user = await this.userService.getUserByNick(nick, {
			id: true,
			nick: true,
			avatarUri: true,
			gamesWon: true,
			gamesLost: true,
			gamesPlayed: true
		});

		const gameMatches = await this.prisma.gameMatch.findMany({
			where: {
				OR: [
						{ userId1: user.id },
						{ userId2: user.id },
				],
			},
			include: {
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
				},
				winnerUser: {
					select: {
						id: true,
					}
				},
			},
		});

		const rank = await this.getUserRank(user.nick);

		let result = {
			user: {
				userId: user.id,
				nick: user.nick,
				avatarUri: user.avatarUri,
				rank: rank,
				wins: user.gamesWon,
				losses: user.gamesLost,
			},
			matches: this.formatGameMatches(gameMatches)
		};

		return result;
	}

	private formatGameMatches(gameMatchesList: any) {
		
		const gameMatchesListFormatted: any[] = gameMatchesList.map((match) => ({
			user1: {
				userId: match.user1.id,
				nick: match.user1.nick,
				avatarUri: match.user1.avatarUri,
				score: match.score1,
				isWinner: match.winnerUserId ? match.user1.id == match.winnerUser.id : false,
			},
			user2: {
				userId: match.user2.id,
				nick: match.user2.nick,
				avatarUri: match.user2.avatarUri,
				score: match.score2,
				isWinner: match.winnerUser ? match.user2.id == match.winnerUser.id : false,
			},
			matchId: match.id,
			matchEnded: match.hasEnded,
			isOriginalPong: match.isOriginalPong
		}));

		return gameMatchesListFormatted;
	}

	private async getUserRank(nick: string) {
		const gameRanking = await this.userService.getGameRanking();

		if (gameRanking.length == 0)
			return 0;

		const user = gameRanking.find(user => user.nick === nick);

		if (!user)
			return 0;

		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}

		return user.rank;
	}


	async duelUserByNick(userId: number, dto: PongDuelDto) {

		try {
			const user = await this.userService.getUserById(userId);
			const otherUser = await this.userService.getUserById(dto.otherUserId);

			if (userId == otherUser.id)
				ThrowHttpException(new BadRequestException, 'No puedes jugar contigo mismo! Reta a otros jugadores');

			this.ws.sendSocketMessageToUser(otherUser.id, 'DUEL', {userId: user.id, nick: user.nick, isOriginal: dto.isOriginal});
			
			return {
				commandExecuted: true,
				response: 'Has retado a jugar a ' + otherUser.nick,
				error: false
			};
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}

}
