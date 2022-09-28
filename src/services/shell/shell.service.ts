import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketShellData, SocketSessionHandler, ReverseShellConnection,
         ShellName, ShellSocketID, ShellID, ClientSocketID,
         ShellBroadcastMessage,
         MessageTypes, SubscriptionMessageTypes, UniqueArray, ShellGetters, ShellQueryFields, SubscriptionSocketData } from 'src/types';
import { ClientShellSubscriptionRequest, TerminalIdentifier } from 'src/types/client.types';

@Injectable()
export class ShellService implements SocketSessionHandler<SocketShellData> {
    private shellSessions: Map<ShellSocketID, SocketShellData> = new Map();
    private nameIndex: Map<ShellName, ShellSocketID> = new Map();

    public registerSession(shellClient: Socket, reverseShellConnection: ReverseShellConnection): SocketShellData {
        if(!reverseShellConnection?.sessionId) {
            shellClient.disconnect(true);
            return null;
        }
        const shellData: SocketShellData = this.extractShellData(shellClient, reverseShellConnection);
        this.addSession(shellClient.id, shellData);
        return shellData;
    }

    public addSession(socketId: string, shellData: SocketShellData): void {
        shellData.subscribedClients = shellData.subscribedClients ?? [];
        this.shellSessions.set(socketId, shellData);
        if(shellData.name) {
            this.indexName(shellData.name, socketId);
        }
    }

    public updateSession(socketId: string, shellData: SocketShellData): void {
        this.addSession(socketId, shellData);
    }

    public indexName(name: string, socketId: ShellSocketID): boolean {
        if( this.nameIndex.has(name) ) return false;
        this.nameIndex.set(name, socketId);
        return true;
    }

    public endSession(socketId: string): void {
        const shellData: SocketShellData = this.shellSessions.get(socketId);
        if(!shellData) return;
        const { name } = shellData;
        this.nameIndex.delete(name);
        this.shellSessions.delete(socketId);
    }

    public getShellBySocketId(socketId): SocketShellData {
        return this.shellSessions.get(socketId) ?? null;
    }

    public getShellByShellId(shellId: ShellID): SocketShellData {
        const shellData: SocketShellData = Array.from(this.shellSessions.values()).find( (shell: SocketShellData) => shell.shellId === shellId );
        if(!shellData) return null;
        return shellData;
    }

    public getShellByName(shellName: ShellName): SocketShellData {
        const socketId: ShellSocketID = this.getShellSocketByName(shellName);
        if(!socketId) return null;
        return this.getShellBySocketId(socketId);
    }

    public getShellClients(shellId: string): SubscriptionSocketData[] {
        const shellData: SocketShellData = this.shellSessions.get(shellId);
        if(!shellData) {
            return null;
        }
        return shellData.subscribedClients;
    }

    public getShellSocketByName(name: string): string {
        const socketId = this.nameIndex.get(name);
        return socketId ?? null;
    }

    public extractShellData(shellClient: Socket, reverseShellConnection: ReverseShellConnection): SocketShellData {
        const { name, additionalData } = reverseShellConnection;
        const { id } = shellClient;
        const shellData: SocketShellData = {
            socketId: id,
            shellId: reverseShellConnection.sessionId,
            name,
            subscribedClients: [],
            additionalData
        };
        return shellData;
    }

    public addClientSubscription(shellSocketId: ShellSocketID, clientSocket: Socket, requestingTerminal: TerminalIdentifier): void {
        const socketShellData: SocketShellData = this.shellSessions.get(shellSocketId);
        if(!socketShellData) return;
        const { subscribedClients } = socketShellData;
        const updatedClients: SubscriptionSocketData[] = [...subscribedClients];
        const entryIndex = updatedClients.findIndex( ({socket}) => socket.id === clientSocket.id);
        if( entryIndex >= 0 ) {
            updatedClients[entryIndex].terminals = UniqueArray<string>([...updatedClients[entryIndex].terminals, requestingTerminal.id]);
        } else {
            const newSubscription = {
                socket: clientSocket,
                terminals: [requestingTerminal.id]
            };
            updatedClients.push(newSubscription);
        }
        const updateData: SocketShellData = {...socketShellData, subscribedClients: UniqueArray<SubscriptionSocketData>(updatedClients)};
        this.shellSessions.set(shellSocketId, updateData);
    }

    public removeClientSubscription(shellSocketId: ShellSocketID, clientId: ClientSocketID): void {
        const socketShellData: SocketShellData = this.shellSessions.get(shellSocketId);
        if(!socketShellData) return;
        const { subscribedClients } = socketShellData;
        if(!subscribedClients?.length) return;
        const updateData: SocketShellData = {...socketShellData, subscribedClients: subscribedClients.filter( ({socket}) => (socket.id !== clientId) )};
        this.shellSessions.set(shellSocketId, updateData);
    }

    public broadcastMessageToSubscribers(shellSocketId: ShellSocketID, message: any, messageType: MessageTypes|SubscriptionMessageTypes = MessageTypes.ShellMessage) {
        // ToDo: Implement Rooms
        const shell = this.shellSessions.get(shellSocketId);
        if(!shell) return;
        const { socketId, shellId, name } = shell
        const broadcastMessage: ShellBroadcastMessage = {
            shell: { socketId, shellId, name },
            message
        };
        shell.subscribedClients.forEach( (clientSocketData: SubscriptionSocketData) =>  clientSocketData.socket.emit(messageType, {...broadcastMessage, terminals: clientSocketData.terminals}));
    }


    public getShellFromRequestConfig(request: ClientShellSubscriptionRequest): SocketShellData {
        const {socketId, shellId, name} = ShellQueryFields;
        const shellQueryKeys: ShellQueryFields[] = [socketId, shellId, name];
        const shellGetterKey = shellQueryKeys.find( (field: ShellQueryFields) => !!request[field]);
        if(!shellGetterKey) {
            console.error(`No valid value found in shell request configuration: One of the following must have a valid value: ${Object.keys(shellQueryKeys)} \nRecieved: ${JSON.stringify(request, null, 2)}`);
            return;
        }
        const shellGetterMethod: ShellGetters = ShellGetters[shellGetterKey];
        const result = this[shellGetterMethod](request[shellGetterKey].trim());
        return result;
    }

};
