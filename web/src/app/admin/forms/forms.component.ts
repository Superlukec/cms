import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  page: string;
  formId: string;

  constructor(
    private _route: ActivatedRoute,
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

  ngOnInit() {

    this.page = this._route.snapshot.paramMap.get('page');

    var checkID = new RegExp("^[0-9a-fA-F]{24}$");
    if (this.page && checkID.test(this.page)) {
      this.formId = this.page;
    }
    else {
      this.formId = null;
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
