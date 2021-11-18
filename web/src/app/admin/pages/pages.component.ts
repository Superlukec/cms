import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from "rxjs";

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  page: string;
  postId: string;
  pageType: string;
  isPageType: Boolean;

  constructor(
    private _route: ActivatedRoute
  ) {

    this.subscription = this._route.url.subscribe((data) => {

      if (data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('subpage');
      }

      /**
       * We resolve the page type
       */
      this.pageType = data[1].path;
      this.isPageType = (this.pageType == 'pages') ? true : false;


      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
        if (this.page && checkID.test(this.page)) {
          this.postId = this.page;  
        }

    });

  }

  ngOnInit() {
    this.page = this._route.snapshot.paramMap.get('subpage');

    if(this.page && (this.page != 'new')) {
      
      let id = this.page;

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
      if (id && checkID.test(id)) {
        this.postId = id;
      }
      else {
        if(this.page != 'trash') {
          this.page = 'new';
        }
      }

    }
  }


  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

