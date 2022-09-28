import { Module } from '@nestjs/common';
import { AppController } from './base/app.controller';
import { AppService } from './base/app.service';
import { SessionGateway } from './gateways/session-gateway/session.gateway';
import { ShellService } from './services/shell/shell.service';
import { ClientService } from './services/client/client.service';
import { MessageGateway } from './gateways/message-gateway/message-gateway.gateway';
import { ClientShellSubscriptionService } from './services/client-shell-subscription/client-shell-subscription.service';
import { SessionRegistrationService } from './services/session-registration/session-registration.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SessionGateway, ShellService, ClientService, MessageGateway, ClientShellSubscriptionService, SessionRegistrationService],
})
export class AppModule {}
