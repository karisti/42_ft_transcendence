import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class OAuthDto{
    @ApiProperty()
    @IsNotEmpty()
    access_token: string
}
