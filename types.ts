export interface TeamMember {
  name: string;
  role: string;
  company: 'TableX' | 'ClearPH';
  initials: string;
}

export interface ClientContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Industry {
  id: string;
  name: string;
}

export interface Application {
  id: string;
  name: string;
}

export interface GanttTask {
  id: number;
  name: string;
  owner: string;
  start: number; // Days offset
  duration: number; // In days
  color: string;
  description: string;
  userNotes?: string; // New field for user persistence
}

export interface DiscoveryActivity {
  id: string;
  title: string;
  desc: string;
}

export interface Deliverable {
  id: string;
  name: string;
  desc: string;
}

export interface ActionItem {
  id: number;
  text: string;
  isCompleted: boolean;
}

export interface SimpleListItem {
  id: string;
  text: string;
}

export type TabID = 'overview' | 'vision' | 'timeline' | 'scope' | 'quotex' | 'actions';