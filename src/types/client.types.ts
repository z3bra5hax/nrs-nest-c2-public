export interface ClientConfigurationData {
    shellSubscriptions?: string[];
    listeningForNames?: string[];
}

export interface TerminalIdentifier {
    id: string;
}

export interface ClientShellNameSubscription {
    name: string;
}

export interface ClientShellSubscriptionRequest {
    socketId?: string;
    shellId?: string;
    name?: string;
    requestingTerminal?: TerminalIdentifier;
}