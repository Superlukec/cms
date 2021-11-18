import { Component, OnInit, Input } from '@angular/core';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';

@Component({
  selector: 'app-v-show-tabs',
  templateUrl: './v-show-tabs.component.html',
  styleUrls: ['./v-show-tabs.component.scss']
})
export class VShowTabsComponent implements OnInit {

  loading: boolean = true;

  @Input() postId: string;
  @Input() blockId: string;

  tabOptions: any = {};
  tabType: string;
  tabsData: any = null;
  maxHeight: string;

  shownText: string;
  showProducts: any[] = [];
  limitProduct: number;
  showExcerpt: boolean;
  columns: number;
  

  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService
  ) { }

  ngOnInit(): void {

    this._siteService.getBlockInfo(
      this._hostService.getSiteId(),
      this.postId,
      this.blockId
    ).subscribe((result: any) => {

      this.loading = false;
      
      if (result.success) {

        this.tabOptions = result.data.options.tabs;
        this.tabsData = result.data.options.tabs.tabs;
        this.maxHeight = result.data.options.tabs.max_height;

        if(this.tabsData[0]) {
          this.tabsData[0].selected = true;
          this.shownText = this.tabsData[0].text;
          this.tabType = this.tabsData[0].tabType;
          this.limitProduct = this.tabsData[0].limit;
          this.showProducts = this.tabsData[0].products;          
          this.showExcerpt = !this.tabsData[0].showExcert;
          this.columns = this.tabsData[0].products_per_column;
        }

      }

    });

  }

  showContent(index: number) {

    console.warn(this.tabsData[index])

    this.tabType = (this.tabsData[index].tabType) ? this.tabsData[index].tabType : '';

    for(let tab of this.tabsData) {
      tab.selected = false;
    }

    this.tabsData[index].selected = true;
    this.shownText = this.tabsData[index].text;
    this.limitProduct = this.tabsData[index].limit;
    this.showProducts = this.tabsData[index].products;    
    this.showExcerpt = !this.tabsData[index].showExcert;
    this.columns = this.tabsData[index].products_per_column;

  }

}
