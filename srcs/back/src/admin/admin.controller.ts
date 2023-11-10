import { Controller, UseGuards, Body, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger"
import { JwtGuard } from "../auth/guard";
import { GetJwt } from "../auth/decorator";
import { AdminService } from "./admin.service";
import { AdminCommandDto } from "./dto";




@UseGuards(JwtGuard)
@Controller('admin')
@ApiBearerAuth()
export class AdminController {
	
	constructor(private adminService: AdminService) { }

	@Post('message')
	@ApiBody({ type: AdminCommandDto })
	async sendAdminMessage(@GetJwt('sub') userId: number, @Body() dto: AdminCommandDto) {
		return this.adminService.sendAdminMessage(userId, dto);
	}
}
