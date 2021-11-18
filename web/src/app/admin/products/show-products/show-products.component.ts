import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { LayoutService } from '../../../services/layout.service';


@Component({
  selector: 'app-show-products',
  templateUrl: './show-products.component.html',
  styleUrls: ['./show-products.component.scss']
})
export class ShowProductsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  showTableTimeoutTriggered: Boolean = false;


  multilanguage: any;
  availableLanguages: any;
  selectedLang: string;
  selectedBrand: string;

  loading: boolean = true;
  displayedColumns: string[] = ['name', 'brand', 'parent_id', 'author', 'sorting', 'date_created', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;
  brands: any[] = [];

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  sortParam = {};
  pageIndex: Number;
  pageSize: Number;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _hostService: HostnameService,
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
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
    this.selectedBrand = (this.sortParam['brand']) ? (this.sortParam['brand']) : 'all';

    

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

        this.getProducts(
          this.selectedLang,
          this.sortParam
        );

        this.getBrands(
          this.selectedLang
        );

      });

    
  }

  getProducts(lang: string, param: any) {
    

    this._siteService.getProducts(
      this._hostService.getSiteId(), 
      (lang) ? lang : this.selectedLang,
      this.selectedBrand,
      param.previousPageIndex,
      param.pageIndex,
      param.pageSize,
      param.active,
      (param.direction) ? param.direction : 'undefined'
    ).subscribe((result: any) => {

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

        /*
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

          
        });*/

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

  getBrands(lang?: string) {

    this._siteService.getBrands(this._hostService.getSiteId(), (lang) ? lang : this.selectedLang).subscribe((result: any) => {

      if (result.success) {

        this.brands = result.data;

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

  /**
   * Delete product
   * @param _id 
   */
  deleteProduct(_id: string) {

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

        this._siteService.deleteProduct(this._hostService.getSiteId(), _id).subscribe((result: any) => {

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

    this.getProducts(lang, this.sortParam);

  }

  onChangeBrand(brand: string) {
    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'brand': brand },
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 

    this.getProducts(this.selectedLang, this.sortParam);

  }

  /*
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pagesData.filter = filterValue.trim().toLowerCase();
  }*/

  //#region paginator
  sortChange(event: any) {

    this.sortParam['active'] = event.active;
    this.sortParam['direction'] = event.direction;

    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'sort': event.active, 'direction': event.direction },
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 

    this.getProducts(
      this.selectedLang,
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

    this.getProducts(
      this.selectedLang,
      this.sortParam
    )
  }
  //#endregion

  //#region table columns
  showTableColumns(size: Number) {

      let columnsToAdd = ['brand', 'parent_id', 'author', 'sorting', 'date_created'];

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
  //#endregion

  //#region sorting
  /**
   * Sorting between products
   * @param element 
   * @param index 
   */  
  sortOrderChange(element: any, index: number) {

    // we save the settings
    this._siteService.saveProductSortOrder(this._hostService.getSiteId(), element._id, element.sort).subscribe((result: any) => {

      if (result.success) {

        // we get the products
        this.getProducts(this.selectedLang, this.sortParam);

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
  //#endregion


  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
