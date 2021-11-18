import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';


@Component({
  selector: 'app-add-tabs',
  templateUrl: './add-tabs.component.html',
  styleUrls: ['./add-tabs.component.scss']
})
export class AddTabsComponent implements OnInit {

  tabs: any[] = [];
  brands: any = [];

  @Input() data: any;
  @Output() output = new EventEmitter<any>();

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService
  ) { }

  ngOnInit(): void {

    let found = false;

    if(this.data) {
      if(this.data.options) {

        if(this.data.options.tabs && this.data.options.tabs.tabs) {
          
          this.tabs = this.data.options.tabs.tabs;
          found = true;

        }

      }
    }

    if(!found) {
      this.addTab();
    }

    this.getBrands();

  }

  onTextChange() {
    this.dataChange();
  }

  onCkEditorValue(index:number, text: string) {
    
    this.tabs[index].text = text;
    this.dataChange();

  }

  addTab() {
    this.tabs.push({
      title: '',
      text: '',
      tabType: '',
      products_per_column: '0',
      brands: JSON.parse(JSON.stringify(this.brands))
    })
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  selectType(index: number, type: string) {   
    this.tabs[index].tabType = type;

    this.dataChange()
  }

  limitChange(index: number, value: any) {

    if(!isNaN(value)) {      
      this.tabs[index].limit = value;
    }
    else {
      this.tabs[index].limit = '';
    }

    this.dataChange()

  }

  dataChange() {
    this.output.emit({
      tabs: this.tabs
    });  
  }

  getBrands() {
    this._siteService.getBrands(this._hostService.getSiteId()).subscribe((result: any) => {

      if (result.success) {
        this.brands = result.data;      

        //#region we show checkbox at selected products
        for(let i = 0; i < this.tabs.length; i++) {

          this.tabs[i].brands = JSON.parse(JSON.stringify(this.brands));

          for(let j = 0; j < this.tabs[i].brands.length; j++) {

            for(let k = 0; k < this.tabs[i].products.length; k++) {

              if(this.tabs[i].brands[j]._id == this.tabs[i].products[k]) {
                this.tabs[i].brands[j].selected = true;
              }

            }

          }

        }
        //#endregion

      }

    });
  }

  selectBrandCheckbox(index: number, selected: boolean, id: string) {

    if(!this.tabs[index].products) {
      this.tabs[index].products = [];
    }

    if(selected) {
      this.tabs[index].products.push(id);
    }
    else {
      let pos = this.tabs[index].products.indexOf(id);
      this.tabs[index].products.splice(pos, 1);
    }    
    
  }

}
