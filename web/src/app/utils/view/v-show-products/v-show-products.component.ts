import { Component, OnInit, Input } from '@angular/core';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { ImageService } from '../../../services/image.service';

@Component({
  selector: 'app-v-show-products',
  templateUrl: './v-show-products.component.html',
  styleUrls: ['./v-show-products.component.scss']
})
export class VShowProductsComponent implements OnInit {

  //activate: boolean = false;
  loading: boolean = true;
  products: any = [];
  selectedBrands: any = [];

  allProperties: any = [];
  
  data: any;
  filter: boolean;
  lang: string;
  customFilter: boolean;
  customFilterData: any = [];

  filterData: string[] = [];

  @Input() postId: string;
  @Input() blockId: string;

  
  firstLoad: boolean = true;
  columnWidth: string = 'col-md-4';

  _brands: any[];
  @Input() set brands(brands:any[]) {
    
    if(!(!this.columns || this.columns == 0)) {
      this.columnWidth = 'col-md-' + (12/this.columns);
    }

    this._brands = brands;
    if(!this.firstLoad) {      
      this.showTabProducts();
    }
  }

  @Input() limit: number;
  @Input() excerpt: boolean;
  @Input() columns: number;

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _imageService: ImageService
  ) { }

  ngOnInit() {

    if(!this._brands) {

      this._siteService.getBlockInfo(
        this._hostService.getSiteId(),
        this.postId,
        this.blockId
      ).subscribe((result: any) => {
        
        if(result && result.success) {
  
          if(result.data.options && result.data.options.products) {          
            this.selectedBrands = result.data.options.products;          
          }
          
          this.lang = 'undefined';
          if(result.data.options && result.data.options.lang) {
            this.lang = result.data.options.lang;
          }

          if(result.data.options.product_limit) {
            this.limit = result.data.options.product_limit;           
          }
  
          if(result.data.options.products_per_column) {
            this.columns = result.data.options.products_per_column;

            if(!(!this.columns || this.columns == 0)) {
              this.columnWidth = 'col-md-' + (12/this.columns);
            }

          }
  
          if(result.data.options.show_excert != null) {
            this.excerpt = !result.data.options.show_excert;
          }
  
          if(result.data.options && result.data.options.filter) {
            this.filter = result.data.options.filter;
          }
  
          if(result.data.options && result.data.options.is_custom_filter) {
            this.customFilter = result.data.options.is_custom_filter;
          }
  
          if(result.data.options && result.data.options.custom_filter) {
            this.customFilterData = result.data.options.custom_filter;          
          }
  
          let promise = new Promise((resolve, reject) => {
  
            this._siteService.getProperties(this._hostService.getSiteId(), this.lang).subscribe((result: any) => {
  
              if(result && result.success) {
                resolve(result.data);
              }
              else {
                resolve([]);
              }
  
            });
            
          });   
  
          promise.then((properties: []) => {
  
            this.allProperties = properties;
  
           
            this._siteService.getBrandProducts(this._hostService.getSiteId(), this.selectedBrands, this.limit).subscribe((result: any) => {
  
              this.loading = false;
  
              if (result.success) {
                this.products = result.data;
              }
  
            }, err => {
                this.loading = false;
            });
  
          });
          
          
  
        }
  
      });
      
    }
    else {      
      this.showTabProducts();      
      this.firstLoad = false;
    }

    

  }

  showTabProducts() {       
    this._siteService.getBrandProducts(this._hostService.getSiteId(), this._brands, this.limit).subscribe((result: any) => {
  
      this.loading = false;

      if (result.success) {
        this.products = result.data;
      }

    }, err => {
        this.loading = false;
    });
  }

  onFilterChange() {

    /*
    if(!this.activate) {

      this.activate = true;

      setTimeout(() => {*/

        let filter = [];

        for(let prop of this.allProperties) {
          if(prop.active) {
            filter.push(prop._id);
          }
        }

        // we send query
        //console.log(this.allProperties);


        this._siteService.getBrandProductsFilter(this._hostService.getSiteId(), this.selectedBrands, filter).subscribe((result: any) => {

          this.loading = false;
  
          if (result.success) {
            this.products = result.data;
          }
  
        });


        /*
        this.activate = false;
      }, 1000)

    }*/

  }



  onFilterCustomChange(enable: boolean, _id: string) {

    /*
    if(!this.activate) {

      this.activate = true;

      setTimeout(() => {        */
        
        if(enable) {
          this.filterData.push(_id);
        }
        else {
          for(let i = 0; i < this.filterData.length; i++) {
            
            if(this.filterData[i] == _id) {

              this.filterData.splice(i, 1);
              i--;

            }

          }
        }         

        this._siteService.getBrandProductsFilter(this._hostService.getSiteId(), this.selectedBrands, this.filterData).subscribe((result: any) => {

          this.loading = false;
  
          if (result.success) {
            this.products = result.data;
          }
  
        });

/*
        this.activate = false;
      }, 1000)

    }*/
    
  }

  onScroll() {
    console.log('scrolled!!');
  }

}
