import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort, MatSortable } from '@angular/material/sort';
import { Subscription } from "rxjs";

import { SiteService } from '../../../../app/services/site.service';
import { HostnameService } from '../../../../app/services/hostname.service';
import { LayoutService } from '../../../../app/services/layout.service';

@Component({
  selector: 'app-show-pages',
  templateUrl: './show-pages.component.html',
  styleUrls: ['./show-pages.component.scss']
})
export class ShowPagesComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  @Input() pageType: string;
  @Input() isPageType: Boolean;

  multilanguage: any;
  availableLanguages: any;
  selectedLang: String;

  page: string;
  postId: string;
  //pageType: string;
  //isPageType: Boolean;

  loading: boolean = true;
  displayedColumns: string[] = ['title', 'author', 'date_created', 'last_change_date'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

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
    private _layoutSizeService: LayoutService
  ) {

    this.subscription = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.showTableColumns(value);
    });

  }

  ngOnInit() {
    this.page = this._route.snapshot.paramMap.get('subpage');

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

    if (!this.page) {

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

        this.getPosts(
          this.selectedLang,
          this.sortParam
        );

      });


    }
    else if (this.page != 'new') {
      /**
       * We edit the single page
       */
      let id = this.page;

      var checkID = new RegExp("^[0-9a-fA-F]{24}$");
      if (id && checkID.test(id)) {
        this.postId = id;
      }
      else {
        this.page = 'new';
      }

    }

  }


  private getPosts(lang, param: any) {

    let getDataService = 
      (this.isPageType) 
      ? 
      this._siteService.getPages(
        this._hostService.getSiteId(), 
        (lang) ? lang : this.selectedLang,
        param.previousPageIndex,
        param.pageIndex,
        param.pageSize,
        param.active,
        (param.direction) ? param.direction : 'undefined'
      ) 
      : 
      this._siteService.getPosts(
        this._hostService.getSiteId(), 
        (lang) ? lang : this.selectedLang,
        param.previousPageIndex,
        param.pageIndex,
        param.pageSize,
        param.active,
        (param.direction) ? param.direction : 'undefined'
      );

    /**
     * We show the table of all pages
     */

    getDataService.subscribe((result: any) => {

      this.loading = false;

      if (result.success) {

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
        // not working
        // fix - because paginator is not working at the beginning
        setTimeout(() => {

          if(this.sortParam && this.sortParam['active']) {

            if(this.sort) {

            let sortState: Sort = {active: this.sortParam['active'], direction: this.sortParam['direction']};
            this.sort.active = sortState.active;
            this.sort.direction = sortState.direction;
            this.sort.sortChange.emit(sortState);

            }
            
          }

          
        }, 2000);*/

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

    this.getPosts(lang, this.sortParam);

  }

  /*
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pagesData.filter = filterValue.trim().toLowerCase();
  }*/

  sortChange(event: any) {    

    this.sortParam['active'] = event.active;
    this.sortParam['direction'] = event.direction;

    const urlTree = this._router.createUrlTree([], {
      queryParams: { 'sort': event.active, 'direction': event.direction },
      queryParamsHandling: "merge",
      preserveFragment: true });
  
    this._router.navigateByUrl(urlTree); 

    this.getPosts(
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

    
    this.getPosts(
      this.selectedLang,
      this.sortParam
    );
  }

  showTableColumns(size: Number) {
    
    
      let columnsToAdd = ['date_created', 'last_change_date'];

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
        }
      }
    
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
