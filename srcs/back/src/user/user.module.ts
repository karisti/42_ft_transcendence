import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserGateway } from './user-status.gateway';
import { WebSocketService } from '../auth/websocket/websocket.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserGateway, WebSocketService]
})
export class UserModule { }
