import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

type PrismaErrorOrHttpException = PrismaClientKnownRequestError | HttpException;

export function ThrowHttpException(error: PrismaErrorOrHttpException, message: string = null) {
	if (error instanceof HttpException) {
		throw new HttpException({
			statusCode: error.getStatus(),
			message: message,
			error: error.name
		},
			error.getStatus());
	}
	switch (error.code) {
		case 'P2002': // Unique constraint violation
			throw new BadRequestException(message);
		case 'P2021': // Table does not exist
			throw new NotFoundException(`Table not found: ${error.meta?.table}`);
		case 'P2025': // Record not found
			throw new NotFoundException(message);
		default:
			throw new BadRequestException(error.message);
	}
}