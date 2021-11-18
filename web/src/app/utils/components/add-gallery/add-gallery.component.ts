import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageService } from '../../../services/image.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';

import { SelectIconDialogComponent } from '../../select-icon-dialog/select-icon-dialog.component';


@Component({
  selector: 'app-add-gallery',
  templateUrl: './add-gallery.component.html',
  styleUrls: ['./add-gallery.component.scss']
})
export class AddGalleryComponent implements OnInit {

  images: any = [];  
  columns: Number = 1;
  stylized_gallery: Boolean = false;
  columns_per_slide: Number = 1;
  gallery_image_height: String;
  gallery_icon_size: String;
  is_cover_image_style: Boolean = false;
  gallery_type: String = 'normal';
  mosaic_image_width: Number = 250;
  show_slideshow_indicator: Boolean = false;
  indicator_color: String = '#333333';

  selectIconDialogRef: MatDialogRef<SelectIconDialogComponent>;

  @Input() data: any;
  @Input() small: boolean;
  @Output() output = new EventEmitter<any>();

  constructor(
    private _dialog: MatDialog,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _imageService: ImageService // rezervirano za template (html)
  ) { }

  async ngOnInit() {

    if(this.data) {

      //console.log(this.data.options)


      if(this.data.value) {
        this.columns = this.data.value;
      }      

      if(this.data.options) {

        if(this.data.options.stylized_gallery) {
          this.stylized_gallery = this.data.options.stylized_gallery;
        }

        if(this.data.options.columns_per_slide) {
          this.columns_per_slide = this.data.options.columns_per_slide;
        }

        if(this.data.options.show_slideshow_indicator) {
          this.show_slideshow_indicator = this.data.options.show_slideshow_indicator;
        }

        if(this.data.options.indicator_color) {
          this.indicator_color = this.data.options.indicator_color;
        }
  
        if(this.data.options.gallery_image_height) {
          this.gallery_image_height = this.data.options.gallery_image_height;
        }

        if(this.data.options.gallery_icon_size) {
          this.gallery_icon_size = this.data.options.gallery_icon_size;
        }
        
        if(this.data.options.gallery) {        
          
          /*this.images = this.data.options.gallery;*/

          for(let i = 0; i < this.data.options.gallery.length; i++) {

            await new Promise(resolve => {
              //setTimeout(() => {

                if(this.data.options.gallery[i] && (this.data.options.gallery[i].icon || this.data.options.gallery[i].image)) {
                  this.images.push(this.data.options.gallery[i]);
                }
                resolve();

              //}, 100 * i);

            });

          }


          for(let i = 0; i < this.images.length; i++) {
            if(this.images[i].sort == undefined) {
              this.images[i].sort = i;
            }
          }

        }

        if(this.data.options.is_cover_image_style) {
          this.is_cover_image_style = this.data.options.is_cover_image_style;
        }

        if(this.data.options.gallery_type) {
          this.gallery_type = this.data.options.gallery_type;
        }

        if(this.data.options.mosaic_image_width) {
          this.mosaic_image_width = this.data.options.mosaic_image_width;
        }
        
      }

    }

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

    this.selectIconDialogRef.afterClosed().subscribe(result => {

      if (result) {

        if(!icon) {

          this.images.push({
            sort: this.images.length,
            icon: result,
            icon_size: '',
            text: '',
            description: '',
            link: ''
          })

        }
        else {
          this.images[index].icon = result;
        }
    
        this.output.emit({
          images: this.images,
          columns: this.columns,
          stylized_gallery: this.stylized_gallery,
          gallery_image_height: this.gallery_image_height,
          gallery_icon_size: this.gallery_icon_size,
          is_cover_image_style: this.is_cover_image_style,
          gallery_type: this.gallery_type,
          mosaic_image_width: this.mosaic_image_width,
          columns_per_slide: this.columns_per_slide,
          show_slideshow_indicator: this.show_slideshow_indicator,
          indicator_color: this.indicator_color 
        });
        
      }
    });

  }

  dataChange() {
    this.output.emit({
      images: this.images,
      columns: this.columns,
      stylized_gallery: this.stylized_gallery,
      gallery_image_height: this.gallery_image_height,
      gallery_icon_size: this.gallery_icon_size,
      is_cover_image_style: this.is_cover_image_style,
      gallery_type: this.gallery_type,
      mosaic_image_width: this.mosaic_image_width,
      columns_per_slide: this.columns_per_slide,
      show_slideshow_indicator: this.show_slideshow_indicator,
      indicator_color: this.indicator_color    
    });  
  }

  delete(index: number) {

    
    this.images.splice(index, 1);

    this.output.emit({
      images: this.images,
      columns: this.columns,
      stylized_gallery: this.stylized_gallery,
      gallery_image_height: this.gallery_image_height,
      gallery_icon_size: this.gallery_icon_size,
      is_cover_image_style: this.is_cover_image_style,
      gallery_type: this.gallery_type,
      mosaic_image_width: this.mosaic_image_width,
      columns_per_slide: this.columns_per_slide,
      show_slideshow_indicator: this.show_slideshow_indicator,
      indicator_color: this.indicator_color    
    });  

  }

  edit(index: number) {

    if(this.images[index]) {

      if(this.images[index].icon) {

        // icon
        this.chooseIcon(index, this.images[index].icon);

      }
      else {

        // image

      }

    }

  }

  onImageUpload(img) {   
    
    this.images.push({
      sort: this.images.length,
      image: img,
      is_cover: false,
      text: '',
      description: '',
      link: ''
    })

    this.output.emit({
      images: this.images,
      columns: this.columns,
      stylized_gallery: this.stylized_gallery,
      gallery_image_height: this.gallery_image_height,
      gallery_icon_size: this.gallery_icon_size,
      is_cover_image_style: this.is_cover_image_style,
      gallery_type: this.gallery_type,
      mosaic_image_width: this.mosaic_image_width,
      columns_per_slide: this.columns_per_slide,
      show_slideshow_indicator: this.show_slideshow_indicator,
      indicator_color: this.indicator_color 
    });  

  }

  onCkEditorValue(index, description: string) {

    this.images[index].description = description;

    this.output.emit({
      images: this.images,
      columns: this.columns,
      stylized_gallery: this.stylized_gallery,
      gallery_image_height: this.gallery_image_height,
      gallery_icon_size: this.gallery_icon_size,
      is_cover_image_style: this.is_cover_image_style,
      gallery_type: this.gallery_type,
      mosaic_image_width: this.mosaic_image_width,
      columns_per_slide: this.columns_per_slide,
      show_slideshow_indicator: this.show_slideshow_indicator,
      indicator_color: this.indicator_color 
    });  
    
  }

  changeSort(index: number, sort: number): void {

    if(!isNaN(sort)) {

      this.images.sort((a, b) => (a.sort > b.sort) ? 1 : -1)

      this.output.emit({
        images: this.images,
        columns: this.columns,
        stylized_gallery: this.stylized_gallery,
        gallery_image_height: this.gallery_image_height,
        gallery_icon_size: this.gallery_icon_size,
        is_cover_image_style: this.is_cover_image_style,
        gallery_type: this.gallery_type,
        mosaic_image_width: this.mosaic_image_width,
        columns_per_slide: this.columns_per_slide,
        show_slideshow_indicator: this.show_slideshow_indicator,
        indicator_color: this.indicator_color 
      }); 

    }
    else {
      this.images[index].sort = 0;
    }

    
  }
}
