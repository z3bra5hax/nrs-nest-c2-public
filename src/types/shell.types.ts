import { NetworkInterfaceInfo } from "os";
import { Socket } from "socket.io";
import { ClientShellSubscriptionRequest, TerminalIdentifier } from "./client.types";
import { SocketID } from "./socket-requests.types";

export type ShellID = string;
export type ShellName = string;

export enum ShellQueryFields {
    socketId = 'socketId',
    shellId = 'shellId',
    name = 'name',
}

export enum ShellGetters {
    socketId = 'getShellBySocketId',
    shellId = 'getShellByShellId',
    name = 'getShellByName',
}

export interface HostIPData {
    ipv4?: string;
    ipv6?: string;
    geo?: string;
    v6Geo?: string;
    isp?: string;
}

export interface SocketShellData {
    socketId: SocketID;
    shellId?: ShellID;
    name?: ShellName;
    subscribedClients?: SubscriptionSocketData[];
    additionalData?: AdditionalShellData;
}

export interface SocketBroadcastShellData extends SocketShellData {
    subscribedClients?: never;
}

export interface AdditionalShellData {
    networkInterfaces?: NodeJS.Dict<NetworkInterfaceInfo[]>;
    ipData?: HostIPData;
}

export interface ShellBroadcastMessage {
    shell: SocketBroadcastShellData;
    message: any;
}

export interface ShellCommandConfiguration extends ClientShellSubscriptionRequest {
    command: string;
}

export interface SubscriptionSocketData {
    terminals: string[];
    socket: Socket;
}