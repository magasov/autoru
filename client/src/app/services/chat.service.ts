import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';
import axios from 'axios';

export interface Chat {
  id: string;
  avatar: string;
  sellerType: string;
  lastSeen: string;
  lastMessageTime: string;
  carName: string;
  price: string;
  lastMessage: string;
  recipientId: string;
  postId?: string;
}

export interface Message {
  id?: string;
  sender: string;
  recipient: string;
  content?: string;
  time?: string;
  postId?: string;
  type?: string; 
  sdp?: any; 
  candidate?: any; 
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
    console.error("WebSocket error:", message.error);
    return;
  }

  if (message.type === "call") {
    const callMessage: Message = {
      type: "call",
      sender: message.senderId,
      recipient: message.recipientId,
      sdp: message.sdp,
      candidate: message.candidate,
    };
    this.messageSubject.next(callMessage);
  } else if (message.type === "chatUpdate") {
    await this.updateChatList(message);
  } else {
    const formattedMessage: Message = {
      id: message._id,
      sender: message.senderId, 
      recipient: message.recipientId, 
      content: message.content,
      time: new Date(message.createdAt).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      postId: message.postId || null,
    };
    this.messageSubject.next(formattedMessage);
    await this.updateChatList(message);
  }
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
      this.chats = await Promise.all(
        response.data.chats.map(async (chat: any) => {
          const recipientId = chat.recipientId._id || chat.recipientId;
          try {
            const userResponse = await axios.get(`${this.apiUrl}/users/${recipientId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const user = userResponse.data.user;
            console.log('User data for recipient', recipientId, ':', user);
            return {
              id: chat._id,
              recipientId: recipientId,
              avatar: user.avatar || 'https://example.com/default-avatar.png',
              sellerType: user.name ? 'Частное лицо' : 'Неизвестно',
              lastMessage: chat.lastMessage || '',
              lastMessageTime: chat.lastMessageTime || '',
              lastSeen: user.lastSeen || 'unknown',
              carName: chat.carName || 'Unknown Car',
              price: chat.price || '0 ₽',
              postId: chat.postId || null,
            };
          } catch (error) {
            console.error(`Ошибка получения данных пользователя ${recipientId}:`, error);
            return {
              id: chat._id,
              recipientId: recipientId,
              avatar: 'https://example.com/default-avatar.png',
              sellerType: 'Неизвестно',
              lastMessage: chat.lastMessage || '',
              lastMessageTime: chat.lastMessageTime || '',
              lastSeen: 'unknown',
              carName: chat.carName || 'Unknown Car',
              price: chat.price || '0 ₽',
              postId: chat.postId || null,
            };
          }
        })
      );
      console.log('Updated chats:', this.chats);
      this.chatsSubject.next(this.chats);
      return this.chats;
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      return [];
    }
  }

  async updateChatList(message: any) {
    const recipientId =
      message.sender._id === this.userId ? message.recipient._id : message.sender._id;
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token not found');
    }
    try {
      const userResponse = await axios.get(`${this.apiUrl}/users/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userResponse.data.user;
      console.log('User data for recipient', recipientId, ':', user);

      const chatIndex = this.chats.findIndex((chat) => chat.recipientId === recipientId);
      if (chatIndex !== -1) {
        this.chats[chatIndex] = {
          ...this.chats[chatIndex],
          lastSeen: user.lastSeen || 'unknown',
          lastMessage: message.content,
          lastMessageTime: new Date(message.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      } else {
        const newChat: Chat = {
          id: message._id,
          recipientId: recipientId,
          avatar: user.avatar || 'https://example.com/default-avatar.png',
          sellerType: user.name ? 'Частное лицо' : 'Неизвестно',
          lastMessage: message.content,
          lastMessageTime: new Date(message.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          lastSeen: user.lastSeen || 'unknown',
          carName: 'Unknown Car',
          price: '0 ₽',
          postId: message.postId || null,
        };
        this.chats.push(newChat);
      }
      console.log('Updated chats after message:', this.chats);
      this.chatsSubject.next(this.chats);
    } catch (error) {
      console.error('Error updating chat list:', error);
    }
  }

  getMessagesObservable(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  getChatsObservable(): Observable<Chat[]> {
    return this.chatsSubject.asObservable();
  }

  async sendMessage(recipientId: string, content: string, postId?: string, lastSeen?: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    let messageData: any;
    try {
      
      messageData = JSON.parse(content);
      if (!messageData.type) {
        
        messageData = { type: 'message', recipientId, content };
        if (postId) {
          const existingMessages = await this.getMessages(recipientId);
          if (existingMessages.length === 0) {
            messageData.postId = postId;
          }
        }
      }
    } catch (error) {
      
      messageData = { type: 'message', recipientId, content };
      if (postId) {
        const existingMessages = await this.getMessages(recipientId);
        if (existingMessages.length === 0) {
          messageData.postId = postId;
        }
      }
    }

    console.log('Sending message:', messageData, 'lastSeen:', lastSeen);
    this.ws.send(JSON.stringify(messageData));

    
    if (messageData.type === 'message') {
      const chatIndex = this.chats.findIndex((chat) => chat.recipientId === recipientId);
      if (chatIndex !== -1 && lastSeen) {
        this.chats[chatIndex] = {
          ...this.chats[chatIndex],
          lastSeen: lastSeen || 'unknown',
          lastMessage: messageData.content,
          lastMessageTime: new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        this.chatsSubject.next(this.chats);
      }
      await this.fetchChats();
    }
  }

  async startChatWithPost(postId: string, content: string, lastSeen?: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const postResponse = await axios.get(`${this.apiUrl}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipientId = postResponse.data.post.userId._id;
      console.log('Post response:', postResponse.data.post, 'lastSeen provided:', lastSeen);
      await this.sendMessage(recipientId, content, postId, lastSeen || postResponse.data.post.userId.lastSeen);
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