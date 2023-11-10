import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class Verify2faDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string // User-provided 2FA code for verification

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    userId: number
}
