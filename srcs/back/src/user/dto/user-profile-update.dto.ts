import { IsNotEmpty, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"
import { File } from "buffer";
import { IsNick } from '../../utils/decorators/is-nick.decorator';

export class UserProfileUpdateDto {
	@ApiProperty()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
	@IsNick()
	nick: string

	@ApiProperty()
	file: File
}
