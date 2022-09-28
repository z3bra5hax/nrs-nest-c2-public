import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageTypes, ShellCommandConfiguration } from 'src/types';
import { ShellService } from '../../services/shell/shell.service';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer()
  private ioServer: Server;

  constructor(
    private shellService: ShellService
  ) {}

  @SubscribeMessage(MessageTypes.Message)
  public handleShellMessage(shellSocket: Socket, payload: string): void {
    this.shellService.broadcastMessageToSubscribers(shellSocket.id, payload);
  }

  @SubscribeMessage(MessageTypes.ShellCommand)
  public sendShellCommand(@MessageBody() requestConfiguration: ShellCommandConfiguration): void {
    const shell = this.shellService.getShellFromRequestConfig(requestConfiguration);
    if(!shell) return;
    const { socketId } = shell;
    const { command } = requestConfiguration;
    this.ioServer.sockets.sockets.get(socketId).emit(MessageTypes.Message, command);
  }
  
};
