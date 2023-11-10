import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import path = require('path');
import { BadRequestException } from '@nestjs/common';


export const saveProfileImageToStorage = {
	storage: diskStorage({
		destination: './uploads/avatars',
		filename: (req, file, cb) => {
			const fileName: string = uuidv4();
			const fileExtension: string = path.parse(file.originalname).ext;
			cb(null, fileName + fileExtension);
		}
	}),
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];

		if (allowedMimeTypes.includes(file.mimetype)) {
			console.log("*** avatar cb TRUE: " + file.mimetype);
			cb(null, true);
		} else {
			console.log("*** avatar cb FALSE");
			cb(new BadRequestException('File must be a png, jpg/jpeg.'), false);
		}
	},
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	}
}
