import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { join } from 'path';
import * as fs from 'fs';
import { ThrowHttpException } from '../../utils/error-handler';


@Injectable()
export class ServeImageService {
	constructor(private prisma: PrismaService, private config: ConfigService) { }

	async serveImage(userId: number, fileName: string, res: Response) {

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			}
		});
		if (user === null) {
			ThrowHttpException(new NotFoundException, 'Usuario no encontrado');
		}
		
		const filePath = join(__dirname, '../../../', this.config.get('PATH_AVATARS'), fileName);
		if (fs.existsSync(filePath)) {
			return res.sendFile(filePath);
		}

		const defaultPath = join(__dirname, '../../../', this.config.get('PATH_AVATARS'), this.config.get('DEFAULT_AVATAR'));
		if (fs.existsSync(defaultPath)) {
			return res.sendFile(defaultPath);
		}
		
		ThrowHttpException(new NotFoundException, 'Imagen no encontrada');
	}
}
