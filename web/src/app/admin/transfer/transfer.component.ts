import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  private subscription: Subscription;

  loading: boolean = true;
  page: string;
  trasnferId: string;

  constructor(
    private _route: ActivatedRoute,
  ) { 


    this.subscription = this._route.url.subscribe((data) => {

      if(data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('subpage');

      }
      
    });
    
  }

  ngOnInit() {

    this.page = this._route.snapshot.paramMap.get('subpage');
    
    if(this.page && (this.page != 'new')) {
      
      let id = this.page;      

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
      if (id && checkID.test(id)) {
        this.trasnferId = id;
      }
      else {
        //this.page = 'new';
      }
    }
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
