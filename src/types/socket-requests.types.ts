import { AdditionalShellData, ShellID, ShellName } from "./shell.types";

export type SocketID = string;
export type ClientSocketID = SocketID;
export type ShellSocketID = SocketID;

export interface SessionRequest {
    sessionId: ShellID;
}

export interface ReverseShellConnection {
    sessionId: ShellID;
    name?: ShellName;
    additionalData?: AdditionalShellData;
}

export enum MessageTypes {
    Message = 'message',
    RegisterReverseShell = 'register-reverse-shell',
    Session = 'session',
    Shells = 'shells',
    Command = 'command',
    ShellMessage = 'shell-message',
    ShellCommand = 'shell-command'
}

export enum SubscriptionMessageTypes {
    SubscribeToShell = 'subscribe-to-shell',
    NewPendingNameSubs = 'new-pending-subscriptions',
    ShellIdNotFound = 'shell-not-found',
    ShellDataFound = 'shell-data',
    ShellPaired = 'shell-paired',
    ShellDisconnect = 'shell-disconnect'
}

export interface SocketSessionHandler<T = any> {
    addSession: (socketId: SocketID, data: T) => void;
    endSession: (socketId: SocketID) => void;
}