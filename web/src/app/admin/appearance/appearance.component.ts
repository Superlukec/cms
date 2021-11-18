import { Component, OnInit } from '@angular/core';
import { SiteService } from '../../services/site.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss']
})
export class AppearanceComponent implements OnInit {

  page: string;
  editTheme: boolean;
  checkID = new RegExp("^[0-9a-fA-F]{24}$");

  constructor(
    private _route: ActivatedRoute,
    private _siteService: SiteService
  ) {

    this._route.url.subscribe((data) => {
      this.page = this._route.snapshot.paramMap.get('subpage');

      if (this.page && this.checkID.test(this.page)) {
        this.editTheme = true;
      }
      else {
        this.editTheme = false;
      }
    });

  }

  ngOnInit() {
    this.page = this._route.snapshot.paramMap.get('subpage');  

    if (this.page && this.checkID.test(this.page)) {
      this.editTheme = true;
    }
    else {
      this.editTheme = false;
    }

  }

}
