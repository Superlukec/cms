import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';


@Component({
  selector: 'app-show-form',
  templateUrl: './show-form.component.html',
  styleUrls: ['./show-form.component.scss']
})
export class ShowFormComponent implements OnInit {

  loading: Boolean = true;
  form_id: string = '';
  forms = [];

  @Input() data: any;
  @Input() lang: string;
  @Output() output = new EventEmitter<any>();

  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService
  ) { }  

  ngOnInit(): void {

    if(this.data && this.data.value) {
      this.form_id = this.data.value;
    }

    this._siteService.getForms(this._hostService.getSiteId()).subscribe((result: any) => {
      
      if (result.success) {
        this.forms = result.data;
      }
      
      this.loading = false;

    }, err => {
      this.loading = false;
    });
    

  }

  dataChange() {
    this.output.emit({
      form_id: this.form_id
    });  
  }

}
