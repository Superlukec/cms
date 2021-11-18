import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {

  page: string;
  templateId: string;

  constructor(
    private _route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.page = this._route.snapshot.paramMap.get('templateid');

    if (!this.page) {      

    }
    else if(this.page != 'new') {

      let id = this.page;

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
      if (id && checkID.test(id)) {
        this.templateId = id;
      }
      else {
        this.page = 'new';
      }

    }
  }

}
