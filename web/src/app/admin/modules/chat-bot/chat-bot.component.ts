import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from "rxjs";

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss']
})
export class ChatBotComponent implements OnInit {

  private subscription: Subscription;

  page: string;
  chatId: string;

  constructor(
    private _route: ActivatedRoute
  ) { 

    this.subscription = this._route.url.subscribe((data) => {

      if (data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('chatid');
      }

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
        if (this.page && checkID.test(this.page)) {
          this.chatId = this.page;  
        }
      });      


  }

  ngOnInit(): void {
  }

}
