import { IsBoolean, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Socket } from 'socket.io';


export class PongGameMatchDto {

	@ApiProperty()
	@IsNumber()
	id: number

	@ApiProperty()
	@IsNumber()
	userId1: number

	@ApiProperty()
	@IsNumber()
	userId2: number

	@ApiProperty()
	@IsBoolean()
	hasEnded: boolean

	@ApiProperty()
	@IsNumber()
	winnerUserId: number

	@ApiProperty()
	@IsNumber()
	score1: number

	@ApiProperty()
	@IsNumber()
	score2: number
}


export class PongGameMatchCreateDto {

	@ApiProperty()
	@IsNumber()
	userId1: number

	@ApiProperty()
	@IsNumber()
	userId2: number

	@ApiProperty()
	@IsBoolean()
	isOriginalPong: boolean
}

export class PongGameMatchUpdateDto {

	@ApiProperty()
	@IsNumber()
	matchId: number

	@ApiProperty()
	@IsBoolean()
	hasEnded: boolean

	@ApiProperty()
	@IsNumber()
	score1: number

	@ApiProperty()
	@IsNumber()
	score2: number

	@ApiProperty()
	@IsNumber()
	winnerUserId: number
}

export class PongGameMatchPlayerDto {
	@ApiProperty()
	@IsNumber()
	userId: number

	@ApiProperty()
	@IsString()
	nick: string

	@ApiProperty()
	socket: Socket
}
