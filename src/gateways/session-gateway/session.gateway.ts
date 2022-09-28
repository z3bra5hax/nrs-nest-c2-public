import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageTypes, ReverseShellConnection, SocketShellData, SubscriptionMessageTypes } from 'src/types';
import { ClientConfigurationData, ClientShellSubscriptionRequest } from 'src/types/client.types';
import { ClientService } from '../../services/client/client.service';
import { ClientShellSubscriptionService } from '../../services/client-shell-subscription/client-shell-subscription.service';
import { ShellService } from '../../services/shell/shell.service';

@WebSocketGateway({cors: true})
export class SessionGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  private ioServer: Server;
  public get server(): Server {
    return this.ioServer;
  }
  
  constructor(
    private shellService: ShellService,
    private clientService: ClientService,
    private clientShellSubscriptionService: ClientShellSubscriptionService
  ){}

  async handleConnection(socket: Socket) {
      console.log(`connection established for ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.clientShellSubscriptionService.handleDisconnect(socket.id);
  }

  @SubscribeMessage(MessageTypes.Session)
  public registerClientInstance(client: Socket, clientConfig?: ClientConfigurationData) {
    this.clientService.addSession(client.id, clientConfig);
    this.clientShellSubscriptionService.clientQueryForShellNames(client);
  }

  @SubscribeMessage(SubscriptionMessageTypes.SubscribeToShell)
  public subscribeToShell(client: Socket, shellSubscriptionRequest: ClientShellSubscriptionRequest): void {
    this.clientShellSubscriptionService.bindClientToShell(client, shellSubscriptionRequest);
  }

  @SubscribeMessage(MessageTypes.RegisterReverseShell)
  public registerReverseShell(shellClient: Socket, reverseShellConnection: ReverseShellConnection): void {
    const shellData: SocketShellData = this.shellService.registerSession(shellClient, reverseShellConnection);
    if(!shellData) return;
    this.clientShellSubscriptionService.notifyNameSubscribers(shellData, this.ioServer);
  }

};
