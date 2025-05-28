import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ChatService, Chat, Message } from '../services/chat.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; 
import axios from 'axios';
import { IsPopupMessageService } from '../services/ispopupmessage.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, NgIf, NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
})
export class MessageComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  isChatSelect: boolean = false;
  messageInput: string = '';
  showEmojiPicker: boolean = false;
  isCallActive: boolean = false;
  isIncomingCall: boolean = false; 
  incomingCallSender: string | null = null; 
  placeholders: string[] = [
    'Здравствуйте',
    'Ещё продается?',
    'Обмен интересует?',
    'Торг возможен?',
    'Где можно посмотреть?',
    'Какая причина продажи?',
  ];
  private messageSubscription: Subscription | null = null;
  private chatsSubscription: Subscription | null = null;
  private queryParamsSubscription: Subscription | null = null;
  private userId: string | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private popupService2: IsPopupMessageService
  ) {}

  async ngOnInit() {
    try {
      const userData = await this.authService.getMe();
      this.userId = userData.user._id;
      if (!this.userId) {
        throw new Error('User ID not found');
      }

      
      this.chatService.initializeWebSocket();

      
      this.messageSubscription = this.chatService.getMessagesObservable().subscribe((message) => {
        if (message.type === 'call') {
          this.handleCallMessage(message);
        } else if (
          this.selectedChat &&
          (message.sender === this.selectedChat.recipientId || message.recipient === this.selectedChat.recipientId)
        ) {
          this.messages.push(message);
        }
      });

      
      this.chatsSubscription = this.chatService.getChatsObservable().subscribe((chats) => {
        this.chats = chats;
        this.queryParamsSubscription = this.route.queryParams.subscribe(async (params) => {
          const recipientId = params['recipientId'];
          if (recipientId && !this.selectedChat) {
            const chat = this.chats.find((c) => c.recipientId === recipientId);
            if (chat) {
              await this.selectChat(chat);
            } else {
              try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/users/${recipientId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const user = response.data.user;
                const newChat: Chat = {
                  id: user._id,
                  recipientId: user._id,
                  sellerType: user.name ? 'Частное лицо' : 'Неизвестно',
                  lastMessage: '',
                  lastMessageTime: '',
                  avatar: user.avatar || 'https://example.com/default-avatar.png',
                  lastSeen: user.lastSeen || '',
                  carName: 'Unknown Car',
                  price: '0 ₽',
                };
                this.chats.push(newChat);
                await this.selectChat(newChat);
              } catch (error) {
                console.error('Ошибка получения данных получателя:', error);
              }
            }
          } else if (this.chats.length > 0 && !this.selectedChat) {
            await this.selectChat(this.chats[0]);
          }
        });
      });
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      alert('Не удалось загрузить данные. Попробуйте позже.');
    }
  }

async startCall() {
  if (!this.selectedChat) {
    console.error('No chat selected');
    alert('Выберите чат для звонка');
    return;
  }

  try {
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };
    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate && this.selectedChat) {
        console.log('Отправка ICE candidate:', candidate);
        this.chatService.sendMessage(this.selectedChat.recipientId, JSON.stringify({
          type: 'call',
          recipientId: this.selectedChat.recipientId,
          candidate,
        }));
      }
    };

    this.peerConnection.ontrack = (event) => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
        console.log('Получен удаленный видеопоток');
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', this.peerConnection?.iceConnectionState);
      if (this.peerConnection?.iceConnectionState === 'failed') {
        alert('Не удалось установить соединение. Попробуйте снова.');
        this.endCall();
      }
    };

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    if (localVideo) {
      localVideo.srcObject = this.localStream;
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('Отправка offer:', offer);
    this.chatService.sendMessage(this.selectedChat.recipientId, JSON.stringify({
      type: 'call',
      recipientId: this.selectedChat.recipientId,
      sdp: offer,
    }));

    this.isCallActive = true;
  } catch (error) {
    console.error('Ошибка при инициализации звонка:', error);
    alert('Не удалось начать звонок. Проверьте доступ к камере и микрофону.');
    this.endCall();
  }
}

  async handleCallMessage(message: Message) {
  if (!this.selectedChat || !this.userId) {
    console.error('Отсутствует selectedChat или userId:', { selectedChat: this.selectedChat, userId: this.userId });
    return;
  }

  console.log('Получено сообщение звонка:', message);

  try {
    if (message.type === 'call' && message.sdp && message.sdp.type === 'offer') {
      if (message.sender === this.selectedChat.recipientId) {
        this.isIncomingCall = true;
        this.incomingCallSender = message.sender;
        console.log(`Входящий звонок от ${message.sender}`);
      } else {
        console.log(`Игнорируется звонок от ${message.sender}, так как не соответствует текущему чату`);
      }
    } else if (message.sdp && message.sdp.type === 'answer' && this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
      console.log('Установлен remoteDescription для answer');
    } else if (message.candidate && this.peerConnection) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
      console.log('Добавлен ICE candidate');
    } else if (message.content === 'call_declined') {
      this.endCall();
      alert('Звонок отклонён получателем');
    } else if (message.content === 'call_ended') {
      this.endCall();
      console.log('Звонок завершен получателем');
    }
  } catch (error) {
    console.error('Ошибка обработки сообщения звонка:', error);
  }
}

async acceptCall() {
  if (!this.selectedChat || !this.incomingCallSender) return;

  try {
    
    this.endCall(); 

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };
    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate && this.selectedChat) {
        this.chatService.sendMessage(this.selectedChat.recipientId, JSON.stringify({
          type: 'call',
          recipientId: this.selectedChat.recipientId,
          candidate,
        }));
      }
    };

    this.peerConnection.ontrack = (event) => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    if (localVideo) {
      localVideo.srcObject = this.localStream;
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });
    }

    
    this.messageSubscription = this.chatService.getMessagesObservable().subscribe(async (message) => {
      if (message.type === 'call' && message.sdp && message.sdp.type === 'offer') {
        if (this.peerConnection) {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.chatService.sendMessage(this.incomingCallSender!, JSON.stringify({
            type: 'call',
            recipientId: this.incomingCallSender,
            sdp: answer,
          }));
          this.isCallActive = true;
          this.isIncomingCall = false;
          this.incomingCallSender = null;
        }
      }
    });

  } catch (error: any) {
    console.error('Ошибка принятия звонка:', error);
    alert(`Не удалось принять звонок: ${error.message}. Проверьте, не занята ли камера или микрофон другим приложением.`);
    this.declineCall();
  }
}

endCall() {
  if (this.peerConnection) {
    this.peerConnection.close();
    this.peerConnection = null;
  }
  if (this.localStream) {
    this.localStream.getTracks().forEach((track) => {
      track.stop(); 
      console.log('Остановлен трек:', track.kind);
    });
    this.localStream = null;
  }
  this.isCallActive = false;
  this.isIncomingCall = false;
  this.incomingCallSender = null;
  const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
  const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
  if (localVideo) localVideo.srcObject = null;
  if (remoteVideo) remoteVideo.srcObject = null;

  if (this.selectedChat) {
    this.chatService.sendMessage(this.selectedChat.recipientId, JSON.stringify({
      type: 'call',
      recipientId: this.selectedChat.recipientId,
      content: 'call_ended',
    }));
  }
}

  declineCall() {
    this.isIncomingCall = false;
    this.incomingCallSender = null;
    if (this.selectedChat) {
      this.chatService.sendMessage(this.selectedChat.recipientId, JSON.stringify({
        type: 'call',
        recipientId: this.selectedChat.recipientId,
        content: 'call_declined',
      }));
    }
  }

  

  async sendGeolocation() {
    if (!this.selectedChat) {
      console.error('No chat selected');
      return;
    }

    if (!navigator.geolocation) {
      this.messageInput = 'Геолокация не поддерживается вашим браузером.';
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const locationMessage = `Моя геолокация: https://www.google.com/maps?q=${latitude},${longitude}`;
      await this.chatService.sendMessage(this.selectedChat.recipientId, locationMessage);
    } catch (error: any) {
      console.error('Ошибка получения геолокации:', error);
      let errorMessage = 'Не удалось получить геолокацию.';
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Доступ к геолокации запрещён. Пожалуйста, разрешите доступ в настройках браузера.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Информация о местоположении недоступна.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Время ожидания запроса геолокации истекло.';
      }
      this.messageInput = errorMessage;
    }
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.chatsSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
    this.chatService.disconnectWebSocket();
    this.endCall();
  }

  getLastSeenText(): string {
    if (!this.selectedChat?.lastSeen) {
      return 'время неизвестно';
    }

    const lastSeenDate = new Date(this.selectedChat.lastSeen);
    if (isNaN(lastSeenDate.getTime())) {
      return 'время неизвестно';
    }

    const now = new Date();
    const lastSeenDay = lastSeenDate.getDate();
    const lastSeenMonth = lastSeenDate.getMonth();
    const lastSeenYear = lastSeenDate.getFullYear();

    const nowDay = now.getDate();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();

    const isToday = lastSeenDay === nowDay && lastSeenMonth === nowMonth && lastSeenYear === nowYear;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      lastSeenDay === yesterday.getDate() &&
      lastSeenMonth === yesterday.getMonth() &&
      lastSeenYear === yesterday.getFullYear();

    const hours = lastSeenDate.getHours().toString().padStart(2, '0');
    const minutes = lastSeenDate.getMinutes().toString().padStart(2, '0');

    if ((now.getTime() - lastSeenDate.getTime()) < 60000) {
      return 'в сети';
    }

    if (isToday) {
      return `был(а) в сети сегодня в ${hours}:${minutes}`;
    } else if (isYesterday) {
      return `был(а) в сети вчера в ${hours}:${minutes}`;
    } else {
      const dateStr = lastSeenDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      return `был(а) в сети ${dateStr} в ${hours}:${minutes}`;
    }
  }

  async selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.showEmojiPicker = false;
    try {
      this.messages = await this.chatService.getMessages(chat.recipientId);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  }

  async sendMessage() {
    if (!this.messageInput.trim() || !this.selectedChat) return;
    try {
      await this.chatService.sendMessage(this.selectedChat.recipientId, this.messageInput);
      this.messageInput = '';
      this.showEmojiPicker = false;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  }

  setClass() {
    this.isChatSelect = true;
  }

  getMessageClass(message: Message): string {
    return message.sender === this.userId ? 'chat__sms' : 'interlocutor';
  }

  toggleMessage(event: Event) {
    event.preventDefault(); 
    this.popupService2.toggle();
  }

  insertPlaceholder(placeholder: string) {
    this.messageInput = placeholder;
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.messageInput += event.detail.unicode;
  }

  onInputChange() {
  }
}