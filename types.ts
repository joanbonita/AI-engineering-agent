export enum EngineeringDomain {
  SOFTWARE = 'Software Engineering',
  MECHANICAL = 'Mechanical Engineering',
  ELECTRICAL = 'Electrical Engineering',
  CIVIL = 'Civil Engineering',
  SYSTEMS = 'Systems Engineering',
  CHEMICAL = 'Chemical Engineering',
}

export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  domain: EngineeringDomain;
  messages: Message[];
  createdAt: number;
}
