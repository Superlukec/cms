import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  page: string;
  userId: string;

  constructor(
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.page = this._route.snapshot.paramMap.get('userid');

    if (!this.page) {      

    }
    else if(this.page != 'new') {

      let id = this.page;

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
      if (id && checkID.test(id)) {
        this.userId = id;
      }
      else {
        this.page = 'new';
      }

    }

  } 

}
