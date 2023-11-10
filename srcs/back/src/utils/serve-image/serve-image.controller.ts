import { Controller, Get, UseGuards, Req, Patch, Body, NotFoundException, Delete, Post, UseInterceptors, UploadedFile, Put, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guard";
import { GetJwt } from "../../auth/decorator";
import { ServeImageService } from "./serve-image.service";


@UseGuards(JwtGuard)
@Controller('uploads')
@ApiBearerAuth()
export class ServeImageController {
	constructor(private serveImageService: ServeImageService) { }

	@Get('avatars/:filename')
	serveImage(@GetJwt('sub') userId: number, @Param('filename') fileName: string, @Res() res: Response) {
		return this.serveImageService.serveImage(userId, fileName, res)
	}
}
