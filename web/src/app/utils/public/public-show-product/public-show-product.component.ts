import { Component, OnInit, Input } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { ImageService } from '../../../services/image.service';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { GoogleAnalyticsService } from '../../../services/google-analytics.service';
import { ConfigService } from '../../../services/config.service';

import { SendInquiryDialogComponent } from '../send-inquiry-dialog/send-inquiry-dialog.component';

//import config from '../../../config';




@Component({
  selector: 'app-public-show-product',
  templateUrl: './public-show-product.component.html',
  styleUrls: ['./public-show-product.component.scss']
})
export class PublicShowProductComponent implements OnInit {

  loading: boolean = true;
  showInquiryButton: boolean;
  formId: string;

  @Input() product: any;
  sendInquiryDialogRef: MatDialogRef<SendInquiryDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _titleService: Title,
    private _imageService: ImageService,   // rezervirano za template (html)
    private _gaService: GoogleAnalyticsService,
    private _metaService: Meta,
    private _config: ConfigService
  ) { }

  ngOnInit() {
    this._titleService.setTitle(this.product.name);

    if(this.product.meta_description) {
      // meta description
      this._metaService.addTags([
        { name: 'description', content: this.product.meta_description }
      ], true);
    }

    if(this.product.meta_keywords) {
      // meta keywords
      this._metaService.addTags([
        { name: 'keywords', content: this.product.meta_keywords }
      ], true);
    }

    this._siteService.getProductSiteSettings(this._hostService.getSiteId()).subscribe((result: any) => {

      this.loading = false;
      
      if (result.success) {

        let settings = (result.data.product_settings);
        if(settings.show_form == true) {
          this.showInquiryButton = true;
          this.formId = settings.form_id;
        }

      }

    }, err => {
      this.loading = false;
    });

  }

  showAttachment(file: any) {

    if(file && file.url) {

      this._gaService.eventEmitter("productPage", "attachment", "attachmentView", file.url);

      let link = file.url;
      if(this._config.isDevelopment() && file.url) {
        link = 'http://localhost:1339' + file.url;
      }

      window.open(
        link,
        '_blank'
      );
    }
  }

  changeImage(id: string) {
    
    for(let image of this.product.images) {      

      if(image._id == id) {

        this._gaService.eventEmitter("productPage", "image", "viewImage", image.file);

        image.hero = true;
      }
      else {
        image.hero = false;
      }
  
    }

  }

  addInquiry() {

    this._gaService.eventEmitter("productPage", "inquiry", "openInquiry", "open");

    this.sendInquiryDialogRef = this._dialog.open(
      SendInquiryDialogComponent,
      {
        width: '350px',
        data: {
          formId: this.formId
        }
      }
    );

    this.sendInquiryDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._gaService.eventEmitter("productPage", "inquiry", "openInquiry", "submit");
      }
      else {
        this._gaService.eventEmitter("productPage", "inquiry", "openInquiry", "no-submit");
      }
    });
  }
 
}
