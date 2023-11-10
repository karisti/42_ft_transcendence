import { IsOptional, IsBoolean, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class EditUserByAdminDto {

	@ApiProperty()
	@IsNumber()
	@IsOptional()
	nick?: string

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	isSiteAdmin?: boolean

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	isBanned?: boolean

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	isVerified2fa?: boolean
}
