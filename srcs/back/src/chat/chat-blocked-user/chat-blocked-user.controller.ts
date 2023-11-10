import { Controller, UseGuards, Body, Post, Delete } from "@nestjs/common";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guard";
import { GetJwt } from "../../auth/decorator";
import { ChatBlockedUserService } from "./chat-blocked-user.service";
import { ChatBlockedDto } from './dto'


@UseGuards(JwtGuard)
@Controller('users/blocks')
@ApiBearerAuth()
export class ChatBlockedUserController {
	
	constructor(private chatBlockedUserService: ChatBlockedUserService) { }

	/*
	@Post()
	@ApiBody({ type: ChatBlockedDto })
	async chatBlockUser(@GetJwt('sub') userId: number, @Body() dto: ChatBlockedDto) {
		return this.chatBlockedUserService.chatBlockUser(userId, dto);
	}
	*/

	@Delete()
	@ApiBody({ type: ChatBlockedDto })
	async chatUnblockUser(@GetJwt('sub') userId: number, @Body() dto: ChatBlockedDto) {
		return this.chatBlockedUserService.chatUnblockUser(userId, dto);
	}
}
