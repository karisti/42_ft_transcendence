import { IsNotEmpty, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"
import { IsNick } from '../../../utils/decorators/is-nick.decorator';

export class FriendDto {
	@ApiProperty()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
	@IsNick()
	nick: string
}
