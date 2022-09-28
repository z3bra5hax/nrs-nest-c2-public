import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ClientSocketID, MessageTypes, ShellName, ShellSocketID, SocketID, SocketShellData, SubscriptionMessageTypes } from 'src/types';
import { ClientConfigurationData, ClientShellSubscriptionRequest } from 'src/types/client.types';
import { ClientService } from '../client/client.service';
import { ShellService } from '../shell/shell.service';

@Injectable()
export class ClientShellSubscriptionService {

    private shellNameSubscriptions: Map<ShellName, ClientSocketID[]> = new Map();

    constructor(
        private shellService: ShellService,
        private clientService: ClientService
    ){}

    private isShellSocket(socketId: SocketID): boolean {
      console.dir(this.shellService.getShellBySocketId(socketId))
      return this.shellService.getShellBySocketId(socketId) ? true : false;
    }

    public registerNameSubscription(name: ShellName, socketId: ClientSocketID): void {
      console.log('registering name subscription')
      const currentSubscriptions: ClientSocketID[] = this.shellNameSubscriptions.get(name);
      const registeredSockets: ClientSocketID[] = currentSubscriptions?.length ? [...currentSubscriptions] : [];
      registeredSockets.push(socketId);
      console.log(`Setting ${name} to `)
      console.dir(registeredSockets);
      this.shellNameSubscriptions.set(name, registeredSockets);
  }

    public notifyNameSubscribers(socketShellData: SocketShellData, ioServer: Server) {
      const { name, socketId, subscribedClients } = socketShellData;
      console.log('notifying');
      const nameQueries: ClientSocketID[] = this.shellNameSubscriptions.get(name) ?? [];
      const nameListeners: Set<ClientSocketID> = new Set([...nameQueries, ...subscribedClients.map( ({socket}) => socket.id )]);
      console.dir(nameListeners)
      console.log('=====================')
      nameListeners.forEach( (clientSocketId: string) => {
        try {
          ioServer.sockets.sockets.get(clientSocketId)?.emit(SubscriptionMessageTypes.ShellDataFound, {name, socketId});
        } catch(error) {
          console.error(error)
        }
      })
    }

    public clientQueryForShellNames(client: Socket): void {
        const clientConfig: ClientConfigurationData = this.clientService.getClient(client.id);
        if(!clientConfig?.listeningForNames?.length) return;
        const shellIds = clientConfig.listeningForNames.reduce( (matches: SocketShellData[], currentName: string) => {
          const shellSocketId = this.shellService.getShellSocketByName(currentName);
          if(shellSocketId) {
            matches.push({name: currentName, socketId: shellSocketId});
          }
          this.registerNameSubscription(currentName, client.id);
          console.log(matches);
          return matches;
        }, []);
        if(Object.keys(shellIds).length) {
          client.emit(MessageTypes.Shells, shellIds);
        } else {
          client.emit(SubscriptionMessageTypes.NewPendingNameSubs, clientConfig.listeningForNames);
        }
    }

    public unsubscribeClient(socketId: ClientSocketID): void {
      for(const [name, subscriptions] of this.shellNameSubscriptions.entries()) {
        if(!subscriptions.includes(socketId)) {
          continue;
        }
        const updatedSubscriptions = subscriptions.filter( (subId: ClientSocketID) => subId !== socketId );
        this.shellNameSubscriptions.set(name, updatedSubscriptions ?? []);
      }
      this.unbindClient(socketId);
    }

    private unbindClient(clientId: ClientSocketID): void {
      const client = this.clientService.getClient(clientId);
      if(!client) return;
      const { shellSubscriptions } = client;
      shellSubscriptions.forEach( (shellSocketId: ShellSocketID) => this.shellService.removeClientSubscription(shellSocketId, clientId) );
    }

    public updateClientNameSubscriptions(clientId: ClientSocketID, newSubs: ShellName[]): ClientConfigurationData {
      const clientData: ClientConfigurationData = this.clientService.getClient(clientId);
      if(!clientData) return;
      const { listeningForNames } = clientData;
      const updatedNameSubscriptions = Array.from(new Set([...listeningForNames, ...newSubs]));
      this.clientService.updateSession(clientId, {...clientData, listeningForNames: updatedNameSubscriptions});
      return this.clientService.getClient(clientId);
    }

    public handleDisconnect(socketId: SocketID): void {
      const isShell: 0|1 = Number(this.isShellSocket(socketId)) as 0|1;
      console.log(`isShell: ${isShell}`)
      const socketService: ClientService|ShellService = [this.clientService, this.shellService][isShell];
      if(isShell) {
        console.log('it\'s a shell disconnecting')
        this.shellService.broadcastMessageToSubscribers(socketId, null, SubscriptionMessageTypes.ShellDisconnect);
      } else {
        this.unsubscribeClient(socketId);
      }
      socketService.endSession(socketId);
    }

    public bindClientToShell(client: Socket, shellSubscriptionRequest: ClientShellSubscriptionRequest): void {
      const clientSocketId: ClientSocketID = client.id;
      const { requestingTerminal } = shellSubscriptionRequest;
      const shell: SocketShellData = this.shellService.getShellFromRequestConfig(shellSubscriptionRequest);
      console.log(`Found: ${shell}`)
      if(!shell) return;
      const { name, additionalData, socketId, shellId } = shell;
      if(name) {
        const updatedClientConfiguration = this.updateClientNameSubscriptions(client.id, [name]);
        if(!(name === shell.name)) this.clientQueryForShellNames(client);
      };
      this.shellService.addClientSubscription(socketId, client, requestingTerminal);
      this.clientService.addShellSubscription(clientSocketId, socketId);
      client.emit(SubscriptionMessageTypes.ShellPaired, { name, socketId, shellId, additionalData, requestingTerminal });
    }
};
