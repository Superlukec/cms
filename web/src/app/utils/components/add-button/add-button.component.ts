import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectIconDialogComponent } from '../../select-icon-dialog/select-icon-dialog.component';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';


@Component({
  selector: 'app-add-button',
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.scss']
})
export class AddButtonComponent implements OnInit {

  loading: Boolean = true;

  // visual properties
  button_text: string = 'Button';
  button_style: string = 'btn-primary';
  button_size: string = '';  
  button_fullwidth: boolean = false;
  button_icon: string;

  // action button
  button_action: string = 'link';
  button_link: string;
  button_actionvalue: string;

  // form array
  forms = [];

  @Input() data: any;
  @Output() output = new EventEmitter<any>();

  selectIconDialogRef: MatDialogRef<SelectIconDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService
  ) { }

  ngOnInit(): void {

    this._siteService.getForms(this._hostService.getSiteId()).subscribe((result: any) => {

      if (result.success) {
        this.forms = result.data;
      }
      
      this.loading = false;

    }, err => {
      this.loading = false;
    });

    if(this.data) {
      if(this.data.options) {

        if(this.data.options.button_text) {
          this.button_text = this.data.options.button_text;
        }

        if(this.data.options.button_style) {
          this.button_style = this.data.options.button_style;
        }
        
        if(this.data.options.button_size) {
          this.button_size = this.data.options.button_size;
        }

        if(this.data.options.button_fullwidth) {
          this.button_fullwidth = this.data.options.button_fullwidth;
        }

        if(this.data.options.button_icon) {
          this.button_icon = this.data.options.button_icon;
        }

        if(this.data.options.button_action) {
          this.button_action = this.data.options.button_action;
        }

        if(this.data.options.button_link) {
          this.button_link = this.data.options.button_link;
        }

        if(this.data.options.button_actionvalue) {
          this.button_actionvalue = this.data.options.button_actionvalue;
        }

      }
    }

    //this.dataChange();

  }

  dataChange() {

    this.output.emit({
      button_text: this.button_text,
      button_style: this.button_style,
      button_size: this.button_size,      
      button_fullwidth: this.button_fullwidth,
      button_icon: this.button_icon,
      button_action: this.button_action,
      button_link: this.button_link,
      button_actionvalue: this.button_actionvalue
    });  
  }

  chooseIcon(index?: number, icon?: string) {

    this.selectIconDialogRef = this._dialog.open(
      SelectIconDialogComponent,
      {
        width: '350px',
        data: {
          icon: icon
        }
      }
    );

    this.selectIconDialogRef.afterClosed().subscribe(icon => {

      if (icon) {

        this.button_icon = icon;

        this.dataChange();
      }

    });

  }

}
