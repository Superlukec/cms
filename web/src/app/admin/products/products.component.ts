import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { SiteService } from '../../../app/services/site.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  page: string;
  productId: string;

  loading: boolean = true;
  displayedColumns: string[] = ['title', 'author', 'date_created'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _route: ActivatedRoute,
    private _siteService: SiteService,
  ) { 

    /*
    this.subscription = this._route.queryParams.subscribe(params => {
      console.log(params)
      let date = params['startdate'];
      console.log(date); // Print the parameter to the console.       
    });*/

    this.subscription = this._route.url.subscribe((data) => {

      if (data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('subpage');     

        var checkID = new RegExp("^[0-9a-fA-F]{24}$");
        if (this.page && checkID.test(this.page)) {
          this.productId = this.page;  
        }
      }

    });

  }

  ngOnInit() {   
    //this.page = this._route.snapshot.paramMap.get('subpage');
    if (this.page && this.page != 'new') {
      let id = this.page;

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
      if (id && checkID.test(id)) {
        this.productId = id;
      }
      else {
        this.page = this._route.snapshot.paramMap.get('subpage');
        this.productId = null;
      }
    }
    else {
      this.page = this._route.snapshot.paramMap.get('subpage');
      this.productId = null;
    }
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
