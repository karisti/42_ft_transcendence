import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";
import { SecondAuthFactorModule } from './second-auth-factor/second-auth-factor.module';

@Module({
	imports: [JwtModule.register({}), SecondAuthFactorModule],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
