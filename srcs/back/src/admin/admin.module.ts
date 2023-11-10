import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserService } from "../user/user.service";
import { WebSocketService } from '../auth/websocket/websocket.service';
import { ChatGateway } from '../chat/chat-socket/chat.gateway';
import { AdminCommandsService } from './admin-commands.service';
import { ChatChannelUserService } from '../chat/chat-channel-user/chat-channel-user.service';
import { ChatChannelService } from '../chat/chat-channel/chat-channel.service';
import { ChatBlockedUserService } from '../chat/chat-blocked-user/chat-blocked-user.service';
import { FriendService } from '../chat/friend/friend.service';



@Module({
  controllers: [AdminController, ],
  providers: [AdminService, UserService, WebSocketService, ChatGateway, AdminCommandsService,
                ChatChannelUserService, ChatChannelService, ChatBlockedUserService, FriendService ],
})
export class AdminModule { }
