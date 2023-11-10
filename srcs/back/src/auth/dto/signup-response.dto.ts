import { ApiProperty } from '@nestjs/swagger';

export class SignupResponseDto {
	@ApiProperty()
	access_token: string;
}
