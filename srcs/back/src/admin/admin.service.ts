import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCommandDto } from './dto';
import { AdminCommandsService } from './admin-commands.service';
import { UserService } from '../user/user.service';



@Injectable()
export class AdminService {

	constructor(private prisma: PrismaService, private userService: UserService,
				private adminCommandsService: AdminCommandsService) { }

	async sendAdminMessage(userId: number, dto: AdminCommandDto) {
		const user = await this.userService.getUserById(userId);

		const response = await this.adminCommandsService.executeCommand(user, dto);
		if (response.commandExecuted == true)
		{
			delete response.commandExecuted;
			return response;
		}
	}

}
