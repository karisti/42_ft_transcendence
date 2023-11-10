import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServeImageModule } from './utils/serve-image/serve-image.module';
import { OAuthModule } from './oauth/oauth.module';
import { PongModule } from './pong/pong.module';
import { SecondAuthFactorModule } from './auth/second-auth-factor/second-auth-factor.module'
import { ChatModule } from './chat/chat.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModule } from './admin/admin.module';


@Module({
	imports: [AuthModule, UserModule, PrismaModule, ServeImageModule,
		PongModule, ChatModule,
		ConfigModule.forRoot({ isGlobal: true }),
		EventEmitterModule.forRoot(),
		OAuthModule, SecondAuthFactorModule, AdminModule
	]
})
export class AppModule { }
