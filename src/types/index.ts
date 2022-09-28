export * from './client.types';
export * from './shell.types';
export * from './socket-requests.types'

export const UniqueArray = <T>(args: T[]): T[] => Array.from(new Set([...args]));