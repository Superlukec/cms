import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { HostnameService } from '../../services/hostname.service';
import { SiteService } from '../../services/site.service';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {

  private subscription: Subscription;
  mainForm: FormGroup;
  searchResult: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _siteService: SiteService
  ) { }

  ngOnInit(): void {

    //#region variable init
    this.mainForm = this._fb.group({
      search: ['']
    });
    //#endregion

    //#region search listener
    this.subscription = this.mainForm.get('search').valueChanges
      .pipe(debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(search => {

        this.searchResult = [];

        if(search != '') {

          this._siteService.findPost(this._hostService.getSiteId(), search).subscribe((result: any) => {

            if(result && result.success) {

              console.log(result.data);

              this.searchResult = result.data;

            }

          }, err => {

            // todo

          });

        }


      });
    //#endregion

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
