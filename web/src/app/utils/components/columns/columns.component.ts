import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';


import { ColumnsDialogComponent } from '../dialog/columns-dialog/columns-dialog.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

import Options from '../../../admin/menu-options';


@Component({
  selector: 'app-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss']
})
export class ColumnsComponent implements OnInit  {

  componentsOptions: any[] = [];

  @Input() id: string;
  @Input() blocks: any;
  @Input() lang: string;
  @Input() set showColumns(columns: string) {
    if(columns) {

      this.confirmDialogRef = this._dialog.open(
        ConfirmDialogComponent,
        {
          width: '350px',
          data: {
            title: 'Are you sure?',
            text: 'You will change the layout of the column. You may loose your existing data.',
            leftButton: 'Cancel',
            rightButton: 'Continue'
          },
          disableClose: true
        }
      );

      this.confirmDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.showDialog();
        }
      });
    }
  }

  
  @Output() data = new EventEmitter<any>();
  @Output() clicked = new EventEmitter<any>();


  //columns: any = [];
  loading: Boolean = true;
  columnsDialogRef: MatDialogRef<ColumnsDialogComponent>;
  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog
  ) {

  }

  ngOnInit() {

    this.componentsOptions = Options.options;

    if(!this.blocks || !this.blocks.length) {

      setTimeout(function () {
        
        this.showDialog();

      }.bind(this), 100);

    }
    else {

      this.loading = false;

    }

  }

  showDialog() {
    this.columnsDialogRef = this._dialog.open(
      ColumnsDialogComponent,
      {
        width: '350px',
        data: { text: '' },
        disableClose: true
      }
    );

    this.columnsDialogRef.afterClosed().subscribe(number => {


      if(this.blocks && this.blocks.length > 0) {

        if(this.blocks.length > number) {

          while(this.blocks.length != number) {
            this.blocks.pop();
          }

        } else if(this.blocks.length < number) {

          while(this.blocks.length != number) {
            this.blocks.push({
              value: '',
              _id: Date.now() + this.blocks.length
            });
          }

        } 
        else {
          // equal
          
        }

      }
      else {
        this.blocks = [];

        for (let i = 0; i < number; i++) {

          this.blocks.push({
            value: '',
            _id: Date.now() + i
          });
        }
      }

      this.loading = false;
    });
  }

  selectElement(_id: String, type: String) {
    for (let i = 0; i < this.blocks.length; i++) {

      if (this.blocks[i]._id == _id) {
        this.blocks[i].type = type;
      }

    }

    /**
     * Emit the data to parent component
     */
    
     this.data.emit({
      id: this.id,
      blocks: this.blocks
    });
  }

  
  detectChange() {
    
    this.data.emit({
      _id: this.id,
      blocks: this.blocks
    });
    
  }

  /**
   * CKEditor - getting the data
   * @param id 
   * @param value 
   */
  onCkEditorValue(id, value) {
    
    for(let element of this.blocks) {

      console.log('id ' + id)
      if(id == element._id) {

        element.value = value;

      }
    
    }
    
    this.detectChange();

  }


  onImageUpload(id, img) {

    for(let element of this.blocks) {

      if(id == element._id) {        

        element.value = img.url;

      }
    
    } 

  }

  onDelete(id) {

    for(let element of this.blocks) {

      if(id == element._id) {        

        element.value = null;

      }
    
    } 

  }

  onHeroData(id, data) {
    for(let element of this.blocks) {

      if (id == element._id) {

        if(data.title) {
          element.value = data.title;
        }
        else {
          element.value = null;
        }

        if(!element.options) {
          element.options = {};
        }

        element.options['subtitle'] = data.subtitle;
        element.options['size'] = data.size;
        element.options['alignment'] = data.alignment;

      }

    }
  }

  /**
   * On HTML image module
   * @param id 
   * @param html 
   */
  onHTMLData(id, html) {
    for (let element of this.blocks) {

      if (id == element._id) {

        element.value = html;

      }

    }
  }

  /**
   * On show form component
   * @param id 
   * @param html 
   */
  onFormData(id, data) {
    console.log(data)
    for (let element of this.blocks) {

      if (id == element._id) {

        if(data.form_id) {
          element.value = data.form_id;
        }
        else {
          element.value = null;
        }

        if(!element.options) {
          element.options = {};
        }        
        
      }

    }
  }


  onGallerysData(id, data) {

    for (let element of this.blocks) {

      if (id == element._id) {

        if(data.columns) {
          element.value = data.columns;
        }
        else {
          element.value = null;
        }

        if(!element.options) {
          element.options = {};
        }

        
        element.options['gallery'] = data.images;
        element.options['stylized_gallery'] = data.stylized_gallery;
        element.options['gallery_image_height'] = data.gallery_image_height;
        element.options['is_cover_image_style'] = data.is_cover_image_style;
        
      }

    }


  }

  onButtonData(id, data) {

    for (let element of this.blocks) {

      if (id == element._id) {

        if(data.columns) {
          //element.value = data.columns;
        }
        else {
          element.value = null;
        }

        if(!element.options) {
          element.options = {};
        }
        
        element.options['button_text'] = data.button_text;
        element.options['button_style'] = data.button_style;
        element.options['button_outline'] = data.button_outline;
        element.options['button_size'] = data.button_size;
        element.options['button_link'] = data.button_link;
        element.options['button_fullwidth'] = data.button_fullwidth;
        
      }

    }
  }

  selectSubComponent(type, index) {

    this.clicked.emit({
      type: type,
      index: index
    });

  }


  /**
   * Show remove button only on hover
   * @param elem 
   * @param mouseenter 
   */
  showRemoveButton(elem: any, mouseenter: boolean) {
    elem['showDelete'] = mouseenter;
  }

  /**
   * Remove components
   * @param elem 
   */
  removeComponent(elem) {
    for (let i = 0; i < this.blocks.length; i++) {

      if (this.blocks[i]._id == elem._id) {
        this.blocks.splice(i, 1);
      }

    }     
    
    this.data.emit({
      id: this.id,
      blocks: this.blocks
    });

    if(this.blocks.length == 0) {
      this.showDialog();
    }
  }

  /**
   * Change component
   * @param elem 
   */
  changeComponent(elem) {
    elem['type'] = '';
    elem['value'] = '';
  }

}
