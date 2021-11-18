import { Component, OnInit } from '@angular/core';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { ConfigService } from '../../../services/config.service';

//import config from '../../../config';

@Component({
  selector: 'app-existing-file',
  templateUrl: './existing-file.component.html',
  styleUrls: ['./existing-file.component.scss']
})
export class ExistingFileComponent implements OnInit {

  development; // = config.development;
  selected: any;

  loading: boolean = true;
  files: any = [];

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _config: ConfigService
  ) { 
    this.development = this._config.isDevelopment();
  }

  ngOnInit(): void {

    this._siteService.getFiles(this._hostService.getSiteId(), true, true, false, false, false, false, false, false)
    .subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
        this.files = result.data;
      }

    }, err => {
      if (err.status != 200) {
        this.loading = false;
      }
    });

  }

  selectImage(id: string) {

    for(let f of this.files) {

      if(id == f._id) {
        this.selected = f;
        f.selected = true;
      }
      else {
        f.selected = false;
      }

    }

  }

}
