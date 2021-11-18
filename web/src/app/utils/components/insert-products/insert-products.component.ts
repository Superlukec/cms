import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AddFilterComponentsDialogComponent } from './add-filter-components-dialog/add-filter-components-dialog.component';


@Component({
  selector: 'app-insert-products',
  templateUrl: './insert-products.component.html',
  styleUrls: ['./insert-products.component.scss']
})
export class InsertProductsComponent implements OnInit {

  selectedLang: string;


  @Input() data: any;  
  @Input() set lang(lang: string) {
    this.selectedLang = lang;

    if(!this.loading) {
      this.getBrands();
    }
  }

  @Output() output = new EventEmitter<any>();
  @Output() options = new EventEmitter<any>();

  productSelect: string = 'false';
  showFilter: string = 'false';
  customFilter: boolean;
  
  loading: boolean = true;
  brands: any = [];
  selectedBrands: any = [];

  product_limit: string;
  show_excert: boolean;
  products_per_column: number;
  filterData: any[] = [];

  addCategoryRef: MatDialogRef<AddFilterComponentsDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit() {

    if(this.data && this.data.options) {

      this.customFilter = this.data.options.is_custom_filter;
      this.filterData = this.data.options.custom_filter;

    }

    this.getBrands();

  }

  getBrands() {
    if(this.data) {
      
      if(this.data.options) {
        
        if(this.data.options.products) {
          this.selectedBrands = this.data.options.products;
        }

        if(this.data.options.product_limit) {
          this.product_limit = this.data.options.product_limit;
        }

        if(this.data.options.products_per_column) {
          this.products_per_column = this.data.options.products_per_column;
        }

        if(this.data.options.show_excert != null) {
          this.show_excert = this.data.options.show_excert;
        }
        
        if(this.data.options.filter) {
          this.showFilter = this.data.options.filter;
        }

      }
    }

    this._siteService.getBrands(this._hostService.getSiteId(), this.selectedLang).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
        this.brands = result.data;

        for(let b of this.brands) {

          for(let selected of this.selectedBrands) {

            if(selected == b._id) {

              b.selected = true;

            }

          }

        }

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
   * Select product (select box)
   * @param productId 
   * /
  selectProduct(productId) {
    this.output.emit(productId);       
  }
  */

 limitChange(value: any) {

    if(!isNaN(value)) {      
      this.product_limit = value;
    }
    else {
      this.product_limit = '';
    }

    this.dataChange()

  }

  dataChange() {
    this.options.emit({
      product_limit: this.product_limit,
      filter: this.showFilter,
      products_per_column: this.products_per_column,
      show_excert: this.show_excert,
      is_custom_filter: this.customFilter,
      custom_filter: this.filterData        
    });          
  }


  selectBrandCheckbox(selected: boolean, id: string) {

    if(selected) {
      this.selectedBrands.push(id);

      this.selectedBrands = this.selectedBrands
        .map(item => item)
        .filter((value, index, self) => self.indexOf(value) === index)
    }
    else {
      let index = this.selectedBrands.indexOf(id);
      this.selectedBrands.splice(index, 1);
    }    


    this.output.emit(this.selectedBrands);

  }


  addCategory(): void {

    this.addCategoryRef = this._dialog.open(
      AddFilterComponentsDialogComponent,
      {
        width: '350px',
        data: {
          lang: this.selectedLang
        },
        disableClose: false
      }
    );

    this.addCategoryRef.afterClosed().subscribe(result => {

      if (result) {

        if(result.length > 0 ) {

          for(let i = 0; i < result.length; i++) {

            // we prepare in the right format

            let data = {
              is_property: result[i].is_property              
            };

            if(!data.is_property) {
              // if category

              data['category'] = {
                _id: result[i].category,
                name: result[i].name              
              }
            }
            else {
              // if property

              data['property'] = {
                _id: result[i].property,
                name: result[i].name       
              }
            }



            this.filterData.push(data);

          }

          this.options.emit({
            filter: this.showFilter,
            is_custom_filter: this.customFilter,
            custom_filter: this.filterData        
          });      

        }

        
      }

    });

  }


  removeElement(index: number): void {
    this.filterData.splice(index, 1);

    this.options.emit({
      filter: this.showFilter,
      is_custom_filter: this.customFilter,
      custom_filter: this.filterData          
    });  
  }
  

}
