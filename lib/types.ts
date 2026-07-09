// lib/types.ts

export interface ReplyContext {
  messageId: string;
  field?: string;
  text: string;
  sender: 'user' | 'bot';
}

export interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  time: string;
  image?: string; // base64 preview
  field?: string; // Field this message is asking about
  replyTo?: ReplyContext; // Reply context
}

export interface LeadState {
  name?: string;
  phone?: string;
  email?: string;
  business?: string;
  project?: string;
  budget?: string;
  timeline?: string;
  requirements?: string;
  [key: string]: string | undefined;
}

export interface ChatRequest {
  messages: Message[];
  imageBase64?: string;
  imageMime?: string;
  replyTo?: ReplyContext;
}

export interface ChatResponse {
  text: string;
  leadCompleted: boolean;
  messageId: string;
  field?: string;
}