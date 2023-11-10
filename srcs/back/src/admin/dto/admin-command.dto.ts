import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class AdminCommandDto {

	@ApiProperty()
	@IsString()
	message: string
}
