import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from "rxjs";

@Component({
  selector: 'app-manage-sites',
  templateUrl: './manage-sites.component.html',
  styleUrls: ['./manage-sites.component.scss']
})
export class ManageSitesComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  page: string;

  constructor(
    private _route: ActivatedRoute
  ) { 

    
    this.subscription = this._route.url.subscribe((data) => {

      if (data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('page');
      }

    });

  }

  ngOnInit(): void {
    this.page = this._route.snapshot.paramMap.get('page');
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
