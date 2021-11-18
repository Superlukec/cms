import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare let ga: Function; // Declare ga as a function


@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  // create our event emitter to send our data to Google Analytics - e.g. 
  // eventEmitter("userPage", "like", "userLabel", 1);
  public eventEmitter(
    eventCategory: string,
    eventAction: string,
    eventLabel: string = null,
    eventValue: string = null
  ) {

    // if not angular SSR
    if (isPlatformBrowser(this.platformId)) {      
      ga('send', 'event', {
        eventCategory: eventCategory,
        eventLabel: eventLabel,
        eventAction: eventAction,
        eventValue: eventValue
      });
    }

  }
}
