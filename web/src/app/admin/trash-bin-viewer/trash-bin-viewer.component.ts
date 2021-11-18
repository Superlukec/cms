import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { HostnameService } from '../../services/hostname.service';
import { SiteService } from '../../services/site.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../utils/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-trash-bin-viewer',
  templateUrl: './trash-bin-viewer.component.html',
  styleUrls: ['./trash-bin-viewer.component.scss']
})
export class TrashBinViewerComponent implements OnInit {

  @Input() pageType: string;

  loading: boolean = true;
  displayedColumns: string[] = ['title', 'author', 'date_created', 'last_change_date', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  sortParam = {};
  pageIndex: Number;
  pageSize: Number;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _dialog: MatDialog
  ) { }

  sortChange(event: any) {

    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'sort': event.active, 'direction': event.direction },
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 

  }

  onPaginator(event: any) {
    const urlTree = this._router.createUrlTree([], {
      queryParams: { //'sort': event.active, 'direction': event.direction 
        'previousPageIndex': event.previousPageIndex,
        'pageIndex': event.pageIndex,
        'pageSize': event.pageSize,
        'length': event.length
      },
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 
  }

  emptyTrash(): void {
    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to remove all ' + this.resultsLength + ' items?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.emptyTrashCan(this._hostService.getSiteId(), this.pageType).subscribe((result: any) => {

          if(result && result.success) {
            this.resultsLength = 0;
          }
          else {
            this._snackBar.open('Error', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }        

        }, err => {
          if (err.status != 200) {
            this._snackBar.open('Error', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });

      }
    });
  
  }

  restorePost(index: number, id: string) {

  
    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will restore this post',
          text: 'Your post will be restored and put back to the posts list.',
          leftButton: 'Cancel',
          rightButton: 'Restore'
        }
      }
    );


    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this._siteService.restorePost( 
          this._hostService.getSiteId(),
          id
        ).subscribe((result: any) => {

          if (result.success) {            
            
            this.pagesData.filteredData.splice(index, 1);
            this.resultsLength--;

          }
          else {
            this._snackBar.open('Error. Please try again.', '', {
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

  deletePost(index: number, id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this post',
          text: 'Are you sure that you want to permanently delete this post?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );


    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this._siteService.permDeletePost( 
          this._hostService.getSiteId(),
          id
        ).subscribe((result: any) => {

          if (result.success) {            
            
            this.pagesData.filteredData.splice(index, 1);
            this.resultsLength--;

          }
          else {
            this._snackBar.open('Error. Please try again.', '', {
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
 
  ngOnInit(): void {


    let getDataService = (this.pageType == 'pages') ? this._siteService.getArchivePages(this._hostService.getSiteId()) : this._siteService.getArchivePosts(this._hostService.getSiteId());

    getDataService.subscribe((result: any) => {

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
            
            this.pagesData.paginator = this.paginator;
            //this.pagesData.paginator. = this.sortParam['previousPageIndex'];
            this.pagesData.paginator.pageIndex = this.sortParam['pageIndex'];
            this.pagesData.paginator.pageSize = this.sortParam['pageSize'];
            this.pagesData.paginator.length = this.sortParam['length'];

          }
          else {
            this.pagesData.paginator = this.paginator;
          }

          
        });

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

}
