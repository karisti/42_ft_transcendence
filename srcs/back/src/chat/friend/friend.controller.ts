import { Controller, Get, UseGuards, Body, Delete, Post, Put } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guard";
import { GetJwt } from "../../auth/decorator";
import { FriendService } from "./friend.service";
import { FriendDto } from "./dto/friend.dto";



@UseGuards(JwtGuard)
@Controller('users')
@ApiBearerAuth()
export class FriendController {
	
	constructor(private friendService: FriendService) { }

	@Post('friends')
	async addFriend(@GetJwt('sub') userId: number, @Body() dto: FriendDto) {
		return this.friendService.addFriend(userId, dto);
	}

	@Put('friends')
	async acceptFriend(@GetJwt('sub') userId: number, @Body() dto: FriendDto) {
		return this.friendService.acceptFriend(userId, dto);
	}

	@Get('friends')
	async getFriends(@GetJwt('sub') userId: number) {
		return this.friendService.getFriends(userId);
	}

	@Get('friends/requests')
	async getFriendRequests(@GetJwt('sub') userId: number) {
		return this.friendService.getFriendRequests(userId);
	}

	@Delete('friends')
	async deleteFriend(@GetJwt('sub') userId: number, @Body() dto: FriendDto) {
		return this.friendService.deleteFriend(userId, dto);
	}

}
