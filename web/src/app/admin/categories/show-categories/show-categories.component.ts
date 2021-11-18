import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';



@Component({
  selector: 'app-show-categories',
  templateUrl: './show-categories.component.html',
  styleUrls: ['./show-categories.component.scss']
})
export class ShowCategoriesComponent implements OnInit {

  multilanguage: any;
  availableLanguages: any;
  selectedLang: String;

  loading: boolean = true;
  displayedColumns: string[] = ['name', 'number', 'author', 'date_created', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  sortParam = {};
  pageIndex: Number;
  pageSize: Number;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _route: ActivatedRoute,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _dialog: MatDialog
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

    this.pageIndex = (this._route.snapshot.queryParams.pageIndex) ? this._route.snapshot.queryParams.pageIndex : 0;
    this.pageSize = (this._route.snapshot.queryParams.pageSize) ? this._route.snapshot.queryParams.pageSize : 10;

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

        this.getCategories(
          this.selectedLang
        );

      });

  }

  private getCategories(lang?) {

    /**
     * We show the table of all pages
     */

    this._siteService.getCategories(this._hostService.getSiteId(), lang).subscribe((result: any) => {

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


  onChangeLang(lang: string) {

    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'lang': lang },
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 

    if(lang == 'all') {      
      this.displayedColumns.splice(1, 0, 'language');
    }
    else {
      for(let i = 0; i < this.displayedColumns.length; i++) {
        if(this.displayedColumns[i] == 'language') {
          this.displayedColumns.splice(i, 1);
        }
      }
    }    

    this.getCategories(lang);

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pagesData.filter = filterValue.trim().toLowerCase();
  }

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

  deleteCategory(_id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this product?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.deleteCategory(this._hostService.getSiteId(), _id).subscribe((result: any) => {

          if (result.success) {

            let dataLength = this.pagesData.filteredData.length;

            for (let i = 0; i < dataLength; i++) {

              if (this.pagesData.filteredData[i]._id == _id) {

                this.pagesData.filteredData.splice(i, 1);
                dataLength--;
                this.resultsLength--;

              }

            }

            this.pagesData = new MatTableDataSource(this.pagesData.filteredData);

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

}
