import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer, DOCUMENT } from '@angular/common';
import { ConfigService } from './config.service';

// import config from '../config';

// https://medium.com/iamdeepinder/creating-a-real-time-app-with-angular-8-and-socket-io-with-nodejs-af63bd59a47f
// import * as io from 'socket.io-client'; // socket.io

declare var io:any; 

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _config: ConfigService
  ) { }

  setupSocketConnection(site_id) {

    return new Promise(resolve => {

      if (isPlatformBrowser(this.platformId)) {

        const jsElmCK = document.createElement('script');
          jsElmCK.type = 'application/javascript';
          jsElmCK.src = this._config.getApiUrl() + '/socket.io/socket.io.js';  
          document.body.appendChild(jsElmCK);
          jsElmCK.onload = () => {

            this.socket = io(this._config.getApiUrl());
           

            resolve();

          };

        }
        else {

          this.socket = {
            on: function(data){},
            emit: function(data, val){}
          }

          resolve();
        }

      });
  }

  sayHello(site_id, user) {

    let info = {
      _id: (user && user._id) ? user._id : 'anonymous-' + Date.now(),
      fullName: (user && user.full_name) ? user.full_name : '',
      site_id: site_id
    }    

    this.socket.emit('hello', info);
  }

  getSocket() {    
    return this.socket;
  }
}
