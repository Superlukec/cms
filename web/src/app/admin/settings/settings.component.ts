import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  page: string;

  constructor(
    private _route: ActivatedRoute
  ) { 

    
    this.subscription = this._route.url.subscribe((data) => {

      if(data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('settingsid');

      }
      
    });


  }

  ngOnInit() {
    this.page = this._route.snapshot.paramMap.get('settingsid');
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
