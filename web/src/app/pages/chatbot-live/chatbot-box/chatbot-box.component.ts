import { Component, OnInit, Input } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';

import { HostnameService } from '../../../services/hostname.service';
import { SocketService } from '../../../services/socket.service';
import { SiteService } from '../../../services/site.service';

@Component({
  selector: 'app-chatbot-box',
  templateUrl: './chatbot-box.component.html',
  styleUrls: ['./chatbot-box.component.scss']
})
export class ChatbotBoxComponent implements OnInit {

  chat_id: string;
  chat_settings: any;
  chat_text: any;

  @Input() set id(id:string) {
    this.chat_id = id;
  }

  @Input() set settings(settings:any) {
    this.chat_settings = settings
  }

  @Input() set text(text:any) {
    this.chat_text = text;
  }

  socket: any;
  //chat_id: String = 'Id-' + Date.now();

  showChatbox: boolean = true;
  startChat: boolean = false;
  messages: any[] = [];
  message: string;
  firstName: string;
  _emailError: boolean = false;
  email: string;
  privacy: boolean = false;;
  _privacyError: boolean = false;

  step: number = 1;

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _socketService: SocketService,
    private _cookieService: CookieService,
  ) { }
  

  ngOnInit(): void {
    this.socket = this._socketService.getSocket();

    this.socket.on('reply', (data: string) => {
      this.messages.push(data);
    });


    if(this._cookieService.get('chatId')) {

      this._siteService.getChat(this._hostService.getSiteId(), this._cookieService.get('chatId')).subscribe((result: any) => {        
  
        if (result.success) {

          //** @todo */
          //console.log(result.data);

        }

      });

      this.step++;
    }
  }

  addText(message: string) {
    this.message = '';

    let messageObject = {};
    messageObject['name'] = this.firstName;
    messageObject['email'] = this.email;
    messageObject['text'] = message;
    messageObject['chat_id'] = this.chat_id;
    messageObject['site_id'] = this._hostService.getSiteId();
    messageObject['date_created'] = Date.now();

    this.messages.push({
      text: message,
      me: true
    });

    this.socket.emit('my message', messageObject);
  }

  continue() {
    this.step++;
  }

  finish() {

    this._emailError = false;
    this._privacyError = false;

    if(!this.email) {
      this._emailError = true;
    }

    if(!this.privacy) {
      this._privacyError = true;
    }

    if(!this.email || !this.privacy) {
      return false;
    }

    this.setCookie('chatId', this.chat_id);
    
    this.startChat = true;
  }

  closeDialog() {
    this.showChatbox = false;

    this.setCookie('chatOff', true);

    this.socket.emit('leave room', {
      chat_id: this.chat_id
    });
  }

  setCookie(cookieName: string, cookieValue: any) {
    let expiredDate = new Date();
    expiredDate.setHours( expiredDate.getHours() + 1 );
    this._cookieService.set(cookieName, cookieValue, expiredDate, '', '', false, 'Strict');
  }

}
