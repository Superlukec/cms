import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { PageInfoService } from '../../../services/page-info.service';
import { ShareableService } from '../../../services/shareable.service';
import { HostnameService } from '../../../services/hostname.service';

@Component({
  selector: 'app-show-portal-shareables',
  templateUrl: './show-portal-shareables.component.html',
  styleUrls: ['./show-portal-shareables.component.scss']
})
export class ShowPortalShareablesComponent implements OnInit {

  shareables: [] = []

  constructor(
    private titleService: Title,
    private _shareableService: ShareableService,  
    private _hostService: HostnameService,  
    private _router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Portal');

    this._shareableService.getShareables(this._hostService.getSiteId()).subscribe((result: any) => {

      if(result && result.success) {
        this.shareables = result.data;
      }

    }, err => {
      if (err.status != 200) {
        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  showSpecific(id) {
    this._router.navigate(['./portal/' + id]);
  }

}
