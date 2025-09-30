// This application doesn't need storage - it's a file generator
// Storage interface kept for template compatibility

export interface IStorage {}

export class MemStorage implements IStorage {}

export const storage = new MemStorage();
