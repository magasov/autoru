import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';
import axios from 'axios';

export interface Chat {
  id: string;
  avatar: string;
  sellerType: string;
  lastMessageTime: string;
  carName: string;
  price: string;
  lastMessage: string;
  recipientId: string;
  postId?: string; 
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  time: string;
  postId?: string; 
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:8080';
  private wsUrl = 'ws://localhost:8080';
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<Message>();
  private chatsSubject = new Subject<Chat[]>();
  private userId: string | null = null;
  private chats: Chat[] = [];

  constructor(private authService: AuthService) {
    this.initializeWebSocket();
  }

  async initializeWebSocket() {
    try {
      const userData = await this.authService.getMe();
      this.userId = userData.user._id;
      if (!this.userId) {
        throw new Error('User ID not found');
      }

      this.ws = new WebSocket(`${this.wsUrl}?userId=${this.userId}`);
      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };
      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.error) {
          console.error('WebSocket error:', message.error);
          return;
        }
        const formattedMessage: Message = {
          id: message._id,
          sender: message.sender._id,
          recipient: message.recipient._id,
          content: message.content,
          time: new Date(message.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          postId: message.postId || null, 
        };
        this.messageSubject.next(formattedMessage);
        await this.updateChatList(message);
      };
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      this.ws.onclose = () => {
        console.log('WebSocket closed');
      };

      
      await this.fetchChats();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  async fetchChats(): Promise<Chat[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await axios.get(`${this.apiUrl}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.chats = response.data.chats;
      this.chatsSubject.next(this.chats);
      console.log(response);
      return this.chats;
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      return [];
    }
  }

  async updateChatList(message: any) {
    const recipientId =
      message.sender._id === this.userId ? message.recipient._id : message.sender._id;
    const chats = await this.fetchChats();
    const chatIndex = chats.findIndex((chat) => chat.recipientId === recipientId);
    if (chatIndex === -1) {
      
      await this.fetchChats();
    } else {
      this.chats = chats;
      this.chatsSubject.next(this.chats);
    }
  }

  getMessagesObservable(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  getChatsObservable(): Observable<Chat[]> {
    return this.chatsSubject.asObservable();
  }

 async sendMessage(recipientId: string, content: string, postId?: string): Promise<void> {
  if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket is not connected');
  }
  
  const existingMessages = await this.getMessages(recipientId);
  if (existingMessages.length > 0) {
    
    this.ws.send(JSON.stringify({ recipientId, content }));
  } else {
    
    this.ws.send(JSON.stringify({ recipientId, content, postId }));
  }
  await this.fetchChats(); 
}

async startChatWithPost(postId: string, content: string): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token not found');
    }
    
    const postResponse = await axios.get(`${this.apiUrl}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const recipientId = postResponse.data.post.userId._id;
    
    await this.sendMessage(recipientId, content, postId);
  } catch (error: any) {
    console.error('Error starting chat:', error);
    throw new Error(error.response?.data?.message || 'Server error');
  }
}

  async getMessages(recipientId: string): Promise<Message[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await axios.get(`${this.apiUrl}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { recipientId },
      });
      return response.data.messages.map((msg: any) => ({
        id: msg._id,
        sender: msg.sender._id,
        recipient: msg.recipient._id,
        content: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        postId: msg.postId || null, 
      }));
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      throw new Error(error.response?.data?.message || 'Server error');
    }
  }



  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}