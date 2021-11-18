import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PageInfoService } from '../../services/page-info.service';



@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss']
})
export class PortalComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  id: string;
  shareables: [] = [];

  constructor(
    private _route: ActivatedRoute,
    private _pageInfoService: PageInfoService
  ) { 
    // TODO
    //this._pageInfoService.hideHeader();    

    this.subscription = this._route.url.subscribe((data) => {
      
      this.id = this._route.snapshot.paramMap.get('id');      

    });

  }

  ngOnInit() {

    this.id = this._route.snapshot.paramMap.get('id');

  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
