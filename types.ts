
export interface NavItem {
  label: string;
  items: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
