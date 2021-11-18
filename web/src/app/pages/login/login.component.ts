import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from "rxjs";




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  page: string;
  requestId: string;

  constructor(
    private _route: ActivatedRoute
  ) { 

    this.subscription = this._route.url.subscribe((data) => {

      if (data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('page');
        this.requestId = this._route.snapshot.paramMap.get('id');
      }     

    });

  }

  ngOnInit() {
    this.page = this._route.snapshot.paramMap.get('page');
    this.requestId = this._route.snapshot.paramMap.get('id');
  }

  

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
