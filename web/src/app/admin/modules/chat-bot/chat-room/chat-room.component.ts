import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SiteService } from '../../../../services/site.service';
import { HostnameService } from '../../../../services/hostname.service';
import { SocketService } from '../../../../services/socket.service';


@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  
  loading: boolean = true;

  socket: any;
  _id: string;

  chat_info: any;
  message: string;
  messages: any[] = [];

  @Input() set id(id:string) {
    this._id = id;

    this.getChatInfo(id);
  }

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _socketService: SocketService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.socket = this._socketService.getSocket();

    this.socket.emit('chat open', {
      chat_id: this._id,
      site_id: this._hostService.getSiteId()
    });

    this.socket.on('new message', (data: any) => {

      if(this.chat_info) {
        if(data.chat_id == this.chat_info.chat_id) {
          data['author'] = true;
          this.messages.push(data);
        }
      }

      
    });
  }

  getChatInfo(id: string) {
    this.loading = true;

    this._siteService.getChat(this._hostService.getSiteId(), id).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
       
        this.chat_info = result.data;

        if(this.chat_info.messages && this.chat_info.messages.length > 0) {
          for(let i = 0; i < this.chat_info.messages.length; i++) {
            this.messages.push(this.chat_info.messages[i]);
          }
        }

      }

    }, err => {
      if (err.status != 200) {
        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  addText(message: string) {
    this.message = '';

    let messageObject = {};    
    messageObject['text'] = message;
    messageObject['chat_id'] = this._id;
    messageObject['site_id'] = this._hostService.getSiteId();

    this.messages.push({
      text: message,
      date_created: Date.now(),
      me: true
    });

    this.socket.emit('reply', messageObject);
  }

}
