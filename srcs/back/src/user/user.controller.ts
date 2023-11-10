import { Controller, Get, UseGuards, Patch, Body, Delete, Post, UseInterceptors, UploadedFile, Put } from "@nestjs/common";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../auth/guard";
import { GetJwt } from "../auth/decorator";
import { UserProfileUpdateDto } from "./dto";
import { UserService } from "./user.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { saveProfileImageToStorage } from "../utils/image-storage"


@UseGuards(JwtGuard)
@Controller('users')
@ApiBearerAuth()
export class UserController {
	constructor(private userService: UserService) { }
	@Get('me')
	async getMe(@GetJwt('sub') userId: number) {
		return this.userService.getUserById(userId);
	}

	@Get('all')
	async getAllUsers(@GetJwt('sub') userId: number) {
		return this.userService.getAllUsers(userId);
	}

	/*
	@Patch('me')
	@ApiBody({ type: EditUserByAdminDto })
	async editUser(@GetJwt('sub') userId: number, @Body() dto: EditUserByAdminDto) {
		return this.userService.editUser(userId, dto);
	}
	*/

	/*
	 * Delete user and all its data (avatar, ...)
	*/
	@Delete('me')
	async deleteUser(@GetJwt('sub') userId: number) {
		return this.userService.deleteUser(userId);
	}

	/*
	 * Get user profile data
	*/
	@Get('profile')
	async getProfile(@GetJwt('sub') userId: number) {
		return this.userService.getProfile(userId);
	}

	/*
	 * Set / update user profile data and profile picture
	*/
	@Put('profile')
	@ApiBody({ type: UserProfileUpdateDto })
	@UseInterceptors(FileInterceptor('file', saveProfileImageToStorage))
	async updateProfileData(@GetJwt('sub') userId: number, @Body() dto: UserProfileUpdateDto, @UploadedFile() file?: Express.Multer.File) {
		return this.userService.updateProfileData(userId, dto, file);
	}

	/*
	 * Remove user profile picture
	*/
	@Delete('profile')
	async deleteProfilePicture(@GetJwt('sub') userId: number) {
		return this.userService.deleteProfilePicture(userId);
	}
	
}
