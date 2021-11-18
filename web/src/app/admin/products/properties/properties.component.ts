import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { AddPropertyDialogComponent } from '../../../utils/add-property-dialog/add-property-dialog.component';
import { AddCategoryPropertyDialogComponent } from '../../../utils/add-category-property-dialog/add-category-property-dialog.component';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { LayoutService } from '../../../services/layout.service';
import { ShowCategoryPropertiesDialogComponent } from './show-category-properties-dialog/show-category-properties-dialog.component';



@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  multilanguage: any;
  availableLanguages: any;
  selectedLang: String;

  loading: boolean = true;
  displayedColumns: string[] = ['name', 'counter', 'author', 'date_created', 'sort', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  categoryData: MatTableDataSource<any>;
  categoryResultsLength = 0;

  categoryPropertyDialogRef: MatDialogRef<AddCategoryPropertyDialogComponent>;
  propertyDialogRef: MatDialogRef<AddPropertyDialogComponent>;
  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;


  sortParam = {};
  pageIndex: Number;
  pageSize: Number;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('categoryPaginator', { read: MatPaginator }) categoryPaginator: MatPaginator;
  @ViewChild('propertyPaginator', { read: MatPaginator }) propertyPaginator: MatPaginator;

  catPropertyDialogRef: MatDialogRef<ShowCategoryPropertiesDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _route: ActivatedRoute,
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

    this.getProperties(
      this.selectedLang
    )

    this.getCategories(
      this.selectedLang
    )


  }

  getCategories(lang?) {

    this._siteService.getCategoryProperties(this._hostService.getSiteId(), lang).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
        this.categoryData = new MatTableDataSource(result.data);

        // fix - because paginator is not working at the beginning
        setTimeout(() => {

          if (this.sortParam && this.sortParam['active']) {

            let sortState: Sort = { active: this.sortParam['active'], direction: this.sortParam['direction'] };
            this.sort.active = sortState.active;
            this.sort.direction = sortState.direction;
            this.sort.sortChange.emit(sortState);

            this.categoryData.sort = this.sort;

          }
          else {
            this.categoryData.sort = this.sort;
          }

          if (this.sortParam && this.sortParam['pageSize']) {

            this.categoryData.paginator = this.categoryPaginator;
            this.categoryData.paginator.pageIndex = this.sortParam['pageIndex'];
            this.categoryData.paginator.pageSize = this.sortParam['pageSize'];
            this.categoryData.paginator.length = this.sortParam['length'];

          }
          else {
            this.categoryData.paginator = this.categoryPaginator;
          }


        });

        this.categoryResultsLength = result.count;
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

  getProperties(lang?) {


    this._siteService.getProperties(this._hostService.getSiteId(), lang).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
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

            this.pagesData.paginator = this.propertyPaginator;
            //this.pagesData.paginator. = this.sortParam['previousPageIndex'];
            this.pagesData.paginator.pageIndex = this.sortParam['pageIndex'];
            this.pagesData.paginator.pageSize = this.sortParam['pageSize'];
            this.pagesData.paginator.length = this.sortParam['length'];

          }
          else {
            this.pagesData.paginator = this.propertyPaginator;
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

  addPropertyCategory() {

    let data = {};
    data['multilanguage'] = this.multilanguage;
    data['availableLanguages'] = (this.availableLanguages && this.availableLanguages.length > 0) ? this.availableLanguages : [];    

    this.categoryPropertyDialogRef = this._dialog.open(
      AddCategoryPropertyDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.categoryPropertyDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCategories()
      }
    });


  }

  addProperty() {

    let data = {};
    data['multilanguage'] = this.multilanguage;
    data['availableLanguages'] = (this.availableLanguages && this.availableLanguages.length > 0) ? this.availableLanguages : [];
    data['categories'] = (this.categoryData.filteredData) ? this.categoryData.filteredData : [];

    this.propertyDialogRef = this._dialog.open(
      AddPropertyDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.propertyDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProperties()    
        this.getCategories()    
      }
    });

  }


  editProperty(data: any) {

    data['multilanguage'] = this.multilanguage;
    data['availableLanguages'] = (this.availableLanguages && this.availableLanguages.length > 0) ? this.availableLanguages : [];
    data['categories'] = (this.categoryData.filteredData) ? this.categoryData.filteredData : [];

    this.propertyDialogRef = this._dialog.open(
      AddPropertyDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.propertyDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProperties()
        this.getCategories()
      }
    });

  }

  /**
   * Delete brand
   * @param _id 
   */
  deleteProperty(_id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this property?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.deleteProperty(this._hostService.getSiteId(), _id).subscribe((result: any) => {

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
            this.getCategories()

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

  editCategory(data: any) {

    data['multilanguage'] = this.multilanguage;
    data['availableLanguages'] = (this.availableLanguages && this.availableLanguages.length > 0) ? this.availableLanguages : [];

    this.categoryPropertyDialogRef = this._dialog.open(
      AddCategoryPropertyDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.categoryPropertyDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCategories()
      }
    });

  }

  /**
   * Delete brand
   * @param _id 
   */
  deleteCategory(_id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this category?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.deleteCategoryProperty(this._hostService.getSiteId(), _id).subscribe((result: any) => {

          if (result.success) {

            let dataLength = this.categoryData.filteredData.length;

            for (let i = 0; i < dataLength; i++) {

              if (this.categoryData.filteredData[i]._id == _id) {

                this.categoryData.filteredData.splice(i, 1);
                dataLength--;
                this.categoryResultsLength--;

              }

            }

            this.categoryData = new MatTableDataSource(this.categoryData.filteredData);

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

    this.getProperties(lang);
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
      preserveFragment: true
    });

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


    let columnsToAdd = ['author', 'date_created', 'sort'];

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

  showPropertiesCategory(name: string, properties: any[]) {
    // catPropertyDialogRef

    this.catPropertyDialogRef = this._dialog.open(
      ShowCategoryPropertiesDialogComponent,
      {
        width: '350px',
        data: {
          name: name,
          properties: properties       
        },
        disableClose: true
      }
    );

    this.catPropertyDialogRef.afterClosed().subscribe(result => {
      if (result) {

      }

    });

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
