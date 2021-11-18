import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TemplateService } from '../../../services/template.service';
import { HostnameService } from '../../../services/hostname.service';

import { Template } from './template'

@Component({
  selector: 'app-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss']
})
export class AddTemplateComponent implements OnInit {

  loading: Boolean = true;
  template_id: string = '';
  template: Template;
  templates = [];

  @Input() data: any;
  @Output() output = new EventEmitter<any>();


  constructor(
    private _templateService: TemplateService,
    private _hostService: HostnameService
  ) { }

  ngOnInit(): void {

    this._templateService.getTemplates(this._hostService.getSiteId()).subscribe((result: any) => {
      
      if (result.success) {
        this.templates = result.data;

        //#region  we add existing data
        if(this.data && this.data.options && this.data.options.template) {

          if(this.data.options.template.template_id) {
            this.template_id = this.data.options.template.template_id;

            for(let t of this.templates) {
              if(this.template_id == t._id) {
                this.template = t;
              }
            }
      
            if(this.data.options.template.fields && this.data.options.template.fields.length > 0) {
              
              for(let i = 0 ; i < this.template.fields.length; i++) {
                this.template.fields[i].value = (this.data.options.template.fields[i] && this.data.options.template.fields[i].value) ? this.data.options.template.fields[i].value : ''; 
              }
              
            }    

          }    

        }

      }
      //#endregion
      
      this.loading = false;

    }, err => {
      this.loading = false;
    });

  }

  templateSelect() {
    
    for(let t of this.templates) {
      if(this.template_id == t._id) {
        this.template = t;
      }
    }

    this.commitChanges();
  }

  changeValue(varName: string, value: string) {
    this.commitChanges();
  }

  commitChanges() {
    this.output.emit({
      template_id: this.template_id,
      fields: this.template.fields
    });  
  }

}

