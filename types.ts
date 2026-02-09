
export enum Mode {
    QuietNebula = 'quietNebula',
    Supernova = 'supernova'
}

export enum View {
    Scan = 'scan',
    Dashboard = 'dashboard'
}

export enum Tab {
    Console = 'console',
    Expeditions = 'expeditions',
    Cargo = 'cargo',
    Logbook = 'logbook',
    StarMap = 'starmap'
}

export interface Task {
    id: number;
    text: string;
    type: 'quietNebula' | 'supernova';
    expeditionId?: number;
    expeditionTitle?: string;
    energyLevel?: number;
    createdAt?: number;
}

export interface CompletedTask {
    id: number;
    type: 'quietNebula' | 'supernova' | 'default';
    x: number; // percentage
    y: number; // percentage
    expeditionId?: number;
    expeditionTitle?: string;
}

export interface LogEntry {
    id: string;
    date: string;
    mood: number;
    text: string;
}
