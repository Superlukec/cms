import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SiteService } from '../../services/site.service';

@Component({
  selector: 'app-select-icon',
  templateUrl: './select-icon.component.html',
  styleUrls: ['./select-icon.component.scss']
})
export class SelectIconComponent implements OnInit {

  selectedIcon: string;
  loading: boolean = true;

  icons: any = [];

  @Input() data: string;
  @Output() selection = new EventEmitter<any>();

  constructor(
    private _siteService: SiteService
  ) { }

  selectIcon(icon: string) {
    this.selectedIcon = icon;
    this.selection.emit(icon);           
  }

  ngOnInit() {

    this._siteService.getSystemFaIcons().subscribe((result: any) => {

      this.loading = false;

      if(result.success) {
        this.icons = result.data;
      }

      if(this.data) {
        this.selectedIcon = this.data;
      }

    });

    
  }

}
