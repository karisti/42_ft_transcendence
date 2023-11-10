import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserService } from "../user/user.service";
import { WebSocketService } from '../auth/websocket/websocket.service';
import { ChatDirectMessageService } from '../chat/chat-direct-message/chat-direct-message.service';
import { ChatBlockedUserService } from './chat-blocked-user/chat-blocked-user.service';
import { ChatChannelService } from '../chat/chat-channel/chat-channel.service';
import { FriendService } from './friend/friend.service';
import { ChatGateway } from './chat-socket/chat.gateway';
import { ChatBlockedUserController } from './chat-blocked-user/chat-blocked-user.controller';
import { ChatChannelController } from './chat-channel/chat-channel.controller';
import { ChatChannelBannedUserController } from './chat-channel-banned-user/chat-channel-banned-user.controller';
import { ChatChannelMessageController } from './chat-channel-message/chat-channel-message.controller';
import { ChatChannelUserController } from './chat-channel-user/chat-channel-user.controller';
import { ChatDirectMessageController } from './chat-direct-message/chat-direct-message.controller';
import { ChatChannelBannedUserService } from './chat-channel-banned-user/chat-channel-banned-user.service';
import { ChatChannelUserService } from './chat-channel-user/chat-channel-user.service';
import { ChatChannelMessageService } from './chat-channel-message/chat-channel-message.service';
import { FriendController } from './friend/friend.controller';
import { ChatCommandsService } from './chat-commands/chat-commands.service';



@Module({
  controllers: [ChatController, ChatBlockedUserController, ChatChannelController,
                ChatChannelBannedUserController, ChatChannelMessageController,
                ChatChannelUserController, ChatDirectMessageController, FriendController],
  providers: [ChatService, UserService, WebSocketService, FriendService, ChatGateway,
              ChatBlockedUserService, ChatChannelService, ChatChannelBannedUserService,
              ChatChannelMessageService, ChatChannelUserService, ChatDirectMessageService,
              ChatCommandsService ],
})
export class ChatModule { }
