import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from "rxjs";

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { BrandDialogComponent } from '../../../utils/brand-dialog/brand-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { LayoutService } from '../../../services/layout.service';


@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  multilanguage: any;
  availableLanguages: any;
  selectedLang: String;

  loading: boolean = true;
  displayedColumns: string[] = ['name', 'author', 'date_created', 'sorting', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  brandDialogRef: MatDialogRef<BrandDialogComponent>;
  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  sortParam = {};
  pageIndex: Number;
  pageSize: Number;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _route: ActivatedRoute,
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _layoutSizeService: LayoutService
  ) {
    this.subscription = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.showTableColumns(value);
    });
  }

  ngOnInit() {

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

    this.selectedLang = (this.sortParam['lang']) ? (this.sortParam['lang']) : 'all';

    let getSiteInfoHandler = this.getSiteInfo(this._hostService.getSiteId());

    getSiteInfoHandler.then((siteInfo: any) => {
      if (siteInfo) {

        this.multilanguage = siteInfo.multilanguage;
        this.availableLanguages = (siteInfo.languages) ? siteInfo.languages : [];

        if (!this.selectedLang && this.availableLanguages.length > 0) {

          for (let lang of this.availableLanguages) {
            if (lang.main) {
              this.selectedLang = lang.prefix;
            }
          }

        }

      }
    });

    this.getBrands(
      this.selectedLang
    )

  }

  getBrands(lang?) {


    this._siteService.getBrands(this._hostService.getSiteId(), (lang) ? lang : this.selectedLang).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {

        console.log('apčih')
        console.log(result.data);

        this.pagesData = new MatTableDataSource(result.data);

        // fix - because paginator is not working at the beginning
        setTimeout(() => {

          if (this.sortParam && this.sortParam['active']) {

            let sortState: Sort = { active: this.sortParam['active'], direction: this.sortParam['direction'] };
            this.sort.active = sortState.active;
            this.sort.direction = sortState.direction;
            this.sort.sortChange.emit(sortState);

            this.pagesData.sort = this.sort;

          }
          else {
            this.pagesData.sort = this.sort;
          }

          if (this.sortParam && this.sortParam['pageSize']) {

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

  addBrand() {

    let data = {};
    data['multilanguage'] = this.multilanguage;
    data['availableLanguages'] = (this.availableLanguages && this.availableLanguages.length > 0) ? this.availableLanguages : [];

    this.brandDialogRef = this._dialog.open(
      BrandDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.brandDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getBrands()
      }
    });

  }


  editBrand(data: any) {

    data['multilanguage'] = this.multilanguage;
    data['availableLanguages'] = (this.availableLanguages && this.availableLanguages.length > 0) ? this.availableLanguages : [];

    this.brandDialogRef = this._dialog.open(
      BrandDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.brandDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getBrands()
      }
    });

  }

  /**
   * Delete brand
   * @param _id 
   */
  deleteBrand(_id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this brand?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.deleteBrand(this._hostService.getSiteId(), _id).subscribe((result: any) => {

          if (result.success) {

            let dataLength = this.pagesData.filteredData.length;

            for (let i = 0; i < dataLength; i++) {

              if (this.pagesData.filteredData[i]._id == _id) {

                console.log('našel')
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

  onChangeLang(lang: string) {

    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'lang': lang },
      queryParamsHandling: "merge",
      preserveFragment: true
    });

    this._router.navigateByUrl(urlTree);

    if (lang == 'all') {
      this.displayedColumns.splice(1, 0, 'language');
    }
    else {
      for (let i = 0; i < this.displayedColumns.length; i++) {
        if (this.displayedColumns[i] == 'language') {
          this.displayedColumns.splice(i, 1);
        }
      }
    }

    this.getBrands(lang);

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pagesData.filter = filterValue.trim().toLowerCase();
  }

  sortChange(event: any) {

    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'sort': event.active, 'direction': event.direction },
      queryParamsHandling: "merge",
      preserveFragment: true
    });

    this._router.navigateByUrl(urlTree);

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

  showTableColumns(size: Number) {


    let columnsToAdd = ['author', 'date_created'];

    if (size < 3) {
      for (let add of columnsToAdd) {
        for (let i = 0; i < this.displayedColumns.length; i++) {
          if (this.displayedColumns[i] == add) {
            this.displayedColumns.splice(i, 1);
            i--;
          }
        }
      }
    }
    else {
      let found = false;

      for (let add of columnsToAdd) {
        for (let col of this.displayedColumns) {
          if (col == add) {
            found = true;
          }
        }
      }

      if (!found) {
        for (let i = 0; i < columnsToAdd.length; i++) {
          this.displayedColumns.push(columnsToAdd[i]);
        }

        let index = this.displayedColumns.indexOf('action');
        this.displayedColumns.splice(index, 1);
        this.displayedColumns.push('action');
      }
    }




  }


  sortOrderChange(element: any, index: number) {

    // we save the settings
    this._siteService.saveBrandSortOrder(this._hostService.getSiteId(), element._id, element.sort).subscribe((result: any) => {

      if (result.success) {

        
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
