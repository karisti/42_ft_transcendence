import { Controller, UseGuards, Get, Query, Post, Body } from "@nestjs/common";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guard";
import { GetJwt } from "../../auth/decorator";
import { PongGameMatchService } from "./pong-game-match.service";
import { PongDuelDto } from './dto';


@UseGuards(JwtGuard)
@Controller('')
@ApiBearerAuth()
export class PongGameMatchController {
	
	constructor(private pongGameMatchService: PongGameMatchService) { }

	@Get('profile/matches')
	async getProfileMatches(@GetJwt('sub') userId: number, @Query('nick') nick: string) {
		return this.pongGameMatchService.getProfileMatches(userId, String(nick));
	}

	@Get('game/ranking')
	async getGameRanking(@GetJwt('sub') userId: number) {
		return this.pongGameMatchService.getGameRanking(userId);
	}

	@Post('game/duel')
	@ApiBody({ type: PongDuelDto })
	async duelUserByNick(@GetJwt('sub') userId: number, @Body() dto: PongDuelDto) {
		return this.pongGameMatchService.duelUserByNick(userId, dto);
	}

}
