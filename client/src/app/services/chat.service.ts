// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';

export interface Chat {
  id: number;
  avatar: string;
  sellerType: string;
  lastMessageTime: string;
  carName: string;
  price: string;
  lastMessage: string;
}

export interface Message {
  id: number;
  sender: 'user' | 'interlocutor';
  text: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chats: Chat[] = [
    {
      id: 1,
      avatar: 'https://avatars.mds.yandex.net/get-autoru-vos/2159521/03bdccaffa8c895ee66384d89648663f/120x90',
      sellerType: 'Частное лицо',
      lastMessageTime: '13:57',
      carName: 'Mercedes-Benz S-Класс VI (W222, C217)',
      price: '5 550 000 ₽',
      lastMessage: 'Ало'
    },
    {
      id: 2,
      avatar: 'http://localhost:8080/uploads/312d4da1-6e28-452d-832f-0f27f6339de1.webp',
      sellerType: 'Частное лицо',
      lastMessageTime: '13:57',
      carName: 'Bmw M5 f90',
      price: '8 000 000 ₽',
      lastMessage: 'Привет'
    }
  ];

  private messages: { [chatId: number]: Message[] } = {
    1: [
      {
        id: 1,
        sender: 'user',
        text: 'Привет',
        time: '13:57'
      },
      {
        id: 2,
        sender: 'interlocutor',
        text: 'Привет',
        time: '13:58'
      },
      {
        id: 3,
        sender: 'user',
        text: 'Ало!',
        time: '13:57'
      }
    ],
    2: [
      {
        id: 1,
        sender: 'user',
        text: 'Привет',
        time: '13:57'
      }
    ]
  };

  getChats(): Chat[] {
    return this.chats;
  }

  getMessages(chatId: number): Message[] {
    return this.messages[chatId] || [];
  }
}