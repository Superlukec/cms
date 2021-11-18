import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { SiteService } from '../../../app/services/site.service';
import { HostnameService } from '../../../app/services/hostname.service';
import { LayoutService } from '../../services/layout.service';
import { ShareableService } from '../../services/shareable.service';
import { ConfigService } from '../../services/config.service';
import { ImageService } from '../../services/image.service';

// import config from '../../config';

import { ImageDimensionDialogComponent } from './image-dimension-dialog/image-dimension-dialog.component';
import { ConfirmDialogComponent } from '../../utils/confirm-dialog/confirm-dialog.component';



@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent implements OnInit {

  //private webUrl; // = config.api_url;

  private subscription: Subscription;
  _public: boolean;
  _transfer: boolean;

  @Input() set public(val) {
    this._public = val;
  }
  @Input() set transfer(val) {
    this._transfer = val;
  }
  
  loading: boolean = true;
  displayedColumns: string[] = ['original_name', 'action']; //['options', 'original_name', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  hostname: string;

  view: string = 'listview';

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;
  imgDimensionDialogRef: MatDialogRef<ImageDimensionDialogComponent>;

  sortParam = {};
  pageIndex: Number;
  pageSize: Number;

  selectNumberLines: number = 0;
  selectNumbers: any[] = [];

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _shareableService: ShareableService,
    private _route: ActivatedRoute,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private _router: Router,
    private _layoutSizeService: LayoutService,
    private _config: ConfigService,
    private _imageService: ImageService
  ) { 

    //this.webUrl = this._config.getApiUrl();

    this.subscription = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.showTableColumns(value);
    });

  }

  ngOnInit() {

    this.hostname = this._hostService.getHostname();

    this.showTableColumns(this._layoutSizeService.getSize());

    this.sortParam = {
      'active': this._route.snapshot.queryParams.sort,
      'direction': this._route.snapshot.queryParams.direction,
      'previousPageIndex': this._route.snapshot.queryParams.direction,
      'pageIndex': (this._route.snapshot.queryParams.pageIndex) ? this._route.snapshot.queryParams.pageIndex : 0,
      'pageSize': (this._route.snapshot.queryParams.pageSize) ? this._route.snapshot.queryParams.pageSize : 10,
      'length': this._route.snapshot.queryParams.length,
      'lang': this._route.snapshot.queryParams.lang
    }    

    this.pageIndex = (this._route.snapshot.queryParams.pageIndex) ? this._route.snapshot.queryParams.pageIndex : 0;
    this.pageSize = (this._route.snapshot.queryParams.pageSize) ? this._route.snapshot.queryParams.pageSize : 10;

    
    this.getFiles(
      this.sortParam
    );

  }

  getFiles(param: any) {

    this._siteService.getFiles(
      this._hostService.getSiteId(), 
      this._public, 
      false, 
      this._transfer,
      param.previousPageIndex,
      param.pageIndex,
      param.pageSize,
      param.active,
      (param.direction) ? param.direction : 'undefined'
    )
    .subscribe((result: any) => {

      this.loading = false;

      if (result.success) {

        console.log(result);

        if(!this.pagesData) {
          this.pagesData = new MatTableDataSource(result.data);                   
          this.pagesData.paginator = this.paginator;     
          this.pagesData.sort = this.sort;
        }
        else {
          this.pagesData.data = [];
          this.pagesData.data = result.data;
        }

        this.resultsLength = result.count;

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

  copied(event) {
    if(event && event.isSuccess) {
      this._snackBar.open('Copied', '', {
        duration: 2000,
      });
    }
  }

  private deleteFile(_id: string) {

    this._siteService.deleteFile(this._hostService.getSiteId(), _id).subscribe((result: any) => {


      if(result.success) {
        let dataLength = this.pagesData.filteredData.length;

        for (let i = 0; i < dataLength; i++) {

          if (this.pagesData.filteredData[i]._id == _id) {

            this.pagesData.filteredData.splice(i, 1);
            dataLength--;
            this.resultsLength--;

          }

        }

        // update table
        this.pagesData._updateChangeSubscription();
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

  safeDelete(_id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this asset?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );


    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        //this._siteService.deleteFile(this._hostService.getSiteId(), _id).subscribe((result: any) => {
        this._siteService.safeDeleteFile(this._hostService.getSiteId(), _id).subscribe((result: any) => {

          if (result.success) {


            console.log(result);
            
            if(!result.data) {
              // we delete file
              
              this.deleteFile(_id);


            }
            else {

              // we don't delete file yet
              console.log('pokažem dialog da nea gre')

              let filesInUse = '<ul>';
              for(let i = 0; i < result.data.length; i++) {
                filesInUse += '<li>' + result.data[i] + '</li>';
              }
              filesInUse += '</ul>';

              this.confirmDialogRef = this._dialog.open(
                ConfirmDialogComponent,
                {
                  width: '350px',
                  data: {
                    title: 'File in use',
                    text: 'File is used in:' + filesInUse + ' Delete anyway?',
                    leftButton: 'Cancel',
                    rightButton: 'Delete anyway'
                  },
                  disableClose: true
                }
              );
          
          
              this.confirmDialogRef.afterClosed().subscribe(result => {
                if (result) {

                  this.deleteFile(_id);

                }
              });



            }

          }
          else {
            this._snackBar.open('Error', result.message, {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
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
    });

  }


  sortChange(event: any) {    

    this.sortParam['active'] = event.active;
    this.sortParam['direction'] = event.direction;

    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'sort': event.active, 'direction': event.direction },
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 

    this.getFiles(
      this.sortParam
    );
  }

  onPaginator(event: any) {

    let queryParams = { //'sort': event.active, 'direction': event.direction 
      'previousPageIndex': event.previousPageIndex,
      'pageIndex': event.pageIndex,
      'pageSize': event.pageSize,
      'length': event.length
    }

    this.sortParam['previousPageIndex'] = event.previousPageIndex;
    this.sortParam['pageIndex'] = event.pageIndex;
    this.sortParam['pageSize'] = event.pageSize;
    this.sortParam['length'] = event.length;
    
    const urlTree = this._router.createUrlTree([], {
      queryParams,
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 
    
    this.getFiles(
      this.sortParam
    );
  }

  showTableColumns(size: Number) {
    
    
      let columnsToAdd = ['filetype', 'filesize', 'file_dimensions', 'date_created', 'author'];

      if(size < 3) {
        for(let add of columnsToAdd) {
          for(let i = 0; i < this.displayedColumns.length; i++) {
            if(this.displayedColumns[i] == add) {
              this.displayedColumns.splice(i, 1);
              i--;
            }
          }
        }
      }
      else {      
        let found = false;

        for(let add of columnsToAdd) {
          for(let col of this.displayedColumns) {
            if(col == add) {
              found = true;
            }
          }
        }

        if(!found) {
          for(let i = 0; i < columnsToAdd.length; i++) {
            this.displayedColumns.push(columnsToAdd[i]);
          }

          let index = this.displayedColumns.indexOf('action');
          this.displayedColumns.splice(index, 1);
          this.displayedColumns.push('action');
        }
      }
    
  }

  prepareDownload(id: string) {

    this._siteService.downloadFile(this._hostService.getSiteId(), id).subscribe((result: any) => {

      if(result && result.success) {
        window.open(this._config.getApiUrl() + "/download/" + result.data, "_blank");
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

  showImgDimensions(dimensions: []) {
    console.log(dimensions);


    this.imgDimensionDialogRef = this._dialog.open(
      ImageDimensionDialogComponent,
      {
        width: '550px',
        data: {
          hostname: this.hostname,
          dimensions: dimensions 
        }
      }
    );

    this.imgDimensionDialogRef.afterClosed().subscribe(result => {

      if (result) {

      }

    });


  }

  selectNumber(select: boolean, id: string) {

    console.log(select);

    if(select == undefined || select == true) {
      select = true;
    }

    if(select) {
      this.selectNumberLines++;
      this.selectNumbers.push(id);
    }
    else {

      for(let i = 0; i < this.selectNumbers.length; i++) {

        if(this.selectNumbers[i] == id) {
          this.selectNumbers.splice(i, 1);
        }

      }

      this.selectNumberLines--;
    }

  }


  changeView(view: string) {
    this.view = view;
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
