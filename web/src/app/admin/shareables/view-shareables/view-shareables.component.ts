import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { LayoutService } from '../../../services/layout.service';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-view-shareables',
  templateUrl: './view-shareables.component.html',
  styleUrls: ['./view-shareables.component.scss']
})
export class ViewShareablesComponent implements OnInit {

  multilanguage: any;
  availableLanguages: any;
  selectedLang: String;

  loading: boolean = true;
  displayedColumns: string[] = ['name', 'public', 'duration', 'author', 'date_created', 'downloaded'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;

  sortParam = {};
  pageIndex: Number;
  pageSize: Number;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _hostService: HostnameService,
    private _router: Router,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _layoutSizeService: LayoutService
  ) { }

  ngOnInit() {

    this.sortParam = {
      'active': this._route.snapshot.queryParams.sort,
      'direction': this._route.snapshot.queryParams.direction,
      'previousPageIndex': this._route.snapshot.queryParams.direction,
      'pageIndex': (this._route.snapshot.queryParams.pageIndex) ? this._route.snapshot.queryParams.pageIndex : 0,
      'pageSize': (this._route.snapshot.queryParams.pageSize) ? this._route.snapshot.queryParams.pageSize : 10,
      'length': this._route.snapshot.queryParams.length,
      'lang': this._route.snapshot.queryParams.lang
    }   

    this.selectedLang = (this.sortParam['lang']) ? (this.sortParam['lang']) : 'all';

    let getSiteInfoHandler = this.getSiteInfo(this._hostService.getSiteId());

    getSiteInfoHandler.then((siteInfo: any) => {

      if(siteInfo) {
        this.multilanguage = siteInfo.multilanguage;
        this.availableLanguages = (siteInfo.languages) ? siteInfo.languages : []; 

        if(!this.selectedLang && this.availableLanguages.length > 0) {

          for(let lang of this.availableLanguages) {
            if(lang.main) {
              this.selectedLang = lang.prefix;
            }
          }

        }

      }

      this.getShareables(
        this.selectedLang
      );

    });

  }

  getShareables(lang?) {

    this._siteService.getShareables(this._hostService.getSiteId(), (lang) ? lang : this.selectedLang).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
        this.pagesData = new MatTableDataSource(result.data);

        // fix - because paginator is not working at the beginning
        setTimeout(() => {
          
          if(this.sortParam && this.sortParam['active']) {

            let sortState: Sort = {active: this.sortParam['active'], direction: this.sortParam['direction']};
            this.sort.active = sortState.active;
            this.sort.direction = sortState.direction;
            this.sort.sortChange.emit(sortState);

            this.pagesData.sort = this.sort;

          }
          else {
            this.pagesData.sort = this.sort;
          }

          if(this.sortParam && this.sortParam['pageSize']) {
            
            //this.pagesData.paginator = this.paginator;
            //this.pagesData.paginator. = this.sortParam['previousPageIndex'];
            //this.pagesData.paginator.pageIndex = this.sortParam['pageIndex'];
            //this.pagesData.paginator.pageSize = this.sortParam['pageSize'];
            //this.pagesData.paginator.length = this.sortParam['length'];

          }
          else {
            this.pagesData.paginator = this.paginator;
          }

          
        });

        this.resultsLength = result.count;
      }

    });

  }

  getSiteInfo(site_id) {

    return new Promise((resolve, reject) => {

      this._siteService.getPostSiteInfo(site_id).subscribe((result: any) => {

        if (result.success) {
          resolve(result.data);
        }
        else {

          resolve([]);

          this._snackBar.open('Error: ' + result.message, '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

      }, err => {

        if (err.status != 200) {

          resolve([]);

          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });


    });

  }

  // bytes to human readable format
  private formatBytes(a,b=2) {
    if(0===a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]
  }

  admin_totalFiles() {

    this._siteService.adminTotalShareables(this._hostService.getSiteId()).subscribe((result: any) => {

      if(result) {
        if(result.success) {
          // we show dialog with information
          
          this.confirmDialogRef = this._dialog.open(
            ConfirmDialogComponent,
            {
              width: '350px',
              data: {
                title: 'Total files',
                text: 'Web assets size: ' + this.formatBytes(result.data),
                leftButton: 'Close'
              }
            }
          );

        }
      }
      

    }, err => {

      if (err.status != 200) {
        // snackbar
        this._snackBar.open('Error', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });
    
  }

}
