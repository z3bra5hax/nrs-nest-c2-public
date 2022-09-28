import { Injectable } from '@nestjs/common';
import { SocketSessionHandler, SocketID, ClientSocketID, ShellSocketID, UniqueArray } from 'src/types';
import { ClientConfigurationData } from 'src/types/client.types';

@Injectable()
export class ClientService implements SocketSessionHandler<ClientConfigurationData> {
    private clientSessions: Map<SocketID, ClientConfigurationData> = new Map();

    private static DEFAULT_CLIENT_CONFIG: ClientConfigurationData = {
        shellSubscriptions: [],
        listeningForNames: []
    }

    private cleanConfig(clientConfig: ClientConfigurationData): ClientConfigurationData {
        if(!clientConfig) return ClientService.DEFAULT_CLIENT_CONFIG;
        const filteredConfig = Object.entries(clientConfig).reduce( (config: ClientConfigurationData, [key, value]) => {
            if(value !== null && value !== undefined) {
                config[key] = value;
            }
            return config;
        },{});
        return {...ClientService.DEFAULT_CLIENT_CONFIG, ...filteredConfig};
    }

    public addSession(socketId: ClientSocketID, clientConfig?: ClientConfigurationData): void {
        this.clientSessions.set(socketId, this.cleanConfig(clientConfig));
    }

    public updateSession(socketId: ClientSocketID, clientConfig?: ClientConfigurationData): void {
        this.addSession(socketId, clientConfig);
    }

    public endSession(socketId: ClientSocketID): void {
        this.clientSessions.delete(socketId);
    }

    public getClient(clientId: ClientSocketID): ClientConfigurationData {
        const clientData: ClientConfigurationData = this.clientSessions.get(clientId);
        return clientData;
    }

    public addShellSubscription(clientId: ClientSocketID, shellSocketId: ShellSocketID): void {
        const clientData: ClientConfigurationData = this.clientSessions.get(clientId);
        console.log(`updating: ${clientId} with ${shellSocketId}`)
        console.dir(clientData)
        if(!clientData) return;
        const { shellSubscriptions } = clientData;
        const updatedSubscriptions: ShellSocketID[] = UniqueArray<ShellSocketID>([...shellSubscriptions, shellSocketId]);
        console.dir(updatedSubscriptions)
        this.clientSessions.set(clientId, {...clientData, shellSubscriptions: updatedSubscriptions});
    }

    public removeShellSubscription(clientId: ClientSocketID, shellSocketId: ShellSocketID): void {
        const clientData = this.clientSessions.get(clientId);
        if(!clientData?.shellSubscriptions?.length) return;
        const { shellSubscriptions } = clientData;
        const updatedSubscriptions = shellSubscriptions?.filter( (socketId: ShellSocketID) => socketId !== shellSocketId ) ?? [];
        this.clientSessions.set(clientId, {...clientData, shellSubscriptions: updatedSubscriptions});
    }

}