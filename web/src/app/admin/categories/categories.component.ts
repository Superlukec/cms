import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  page: string;
  categoryId: string;  
  
  constructor(
    private _route: ActivatedRoute    
  ) {


    this._route.url.subscribe((data) => {

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

    if(!this.page) {

      /**
       * We show the table of all pages
       */
      
    }
    else if(this.page != 'new') {
      /**
       * We edit the single page
       */
      let id = this.page;

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
      if (id && checkID.test(id)) {
        this.categoryId = id;
      }
      else {
        this.page = 'new';
      }

    }

  }

}
