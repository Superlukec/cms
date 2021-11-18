import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { HostnameService } from '../../services/hostname.service';
import { SocketService } from '../../services/socket.service';


@Component({
  selector: 'app-chatbot-live',
  templateUrl: './chatbot-live.component.html',
  styleUrls: ['./chatbot-live.component.scss']
})
export class ChatbotLiveComponent implements OnInit {

  isWorkingHoursEnabled: boolean;

  chatbot: any = [];
  settings: any;
  text: any;

  @Input() set chatbots(chat: any[]) {

    if(chat.length > 0) {

      for(let i = 0; i < chat.length; i++) {
        for(let j = 0; j < this.chatbot.length; j++) {
          if(chat[i].chat_id == this.chatbot[j].chat_id) {

            chat.splice(i, 1);
            i--;
          }
        }
      }

      for(let i = 0; i < chat.length; i++) {
        this.chatbot.push(chat[i]);
      }

    }
 
  }

  @Input() set chatSettings(settings: any) {
    this.settings = settings;

    if(settings) {
      
      if(settings.working_hours_enabled) {
        
        let currentDate = new Date();
        let working_hours = settings.working_hours;

        for(let i = 0; i < working_hours.length; i++) {

          if(currentDate.getDay() == working_hours[i].day) {

            if(!working_hours[i].closed) {

              if(working_hours[i].from_hour <= currentDate.getHours() && currentDate.getHours() < working_hours[i].to_hour) {
                this.isWorkingHoursEnabled = false;
              }
              else {
                this.isWorkingHoursEnabled = true;
              }

            }
            else {

              this.isWorkingHoursEnabled = true;

            }

          }

        }       

      }
      else {
        this.isWorkingHoursEnabled = false;
      }

    }

  } 

  @Input() set chatText(text: any) {
    this.text = text;
  }

  constructor(
    private _cookieService: CookieService
  ) { } 

  ngOnInit(): void {   

    //console.log(this.chatSettings)
    //console.log(this.chatText)

    if(this._cookieService.get('chat_id')) {
      this.chatbot.push({
        chat_id : this._cookieService.get('chat_id')
      });
    }
    
  }


}
