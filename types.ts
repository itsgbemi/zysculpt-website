
export interface FileInfo {
  name: string;
  size: string;
  type: string;
}

export interface StagedFile {
  file: File;
  info: FileInfo;
  preview?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  files?: FileInfo[];
}

export interface NavItem {
  label: string;
  items: string[];
}
