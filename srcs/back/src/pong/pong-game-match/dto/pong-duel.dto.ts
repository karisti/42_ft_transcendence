import { IsNumber, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PongDuelDto {
	@ApiProperty()
	@IsNumber()
	otherUserId: number

	@ApiProperty()
	@IsBoolean()
	isOriginal: boolean
}