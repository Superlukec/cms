declare var $:any; 

import { Component, PLATFORM_ID, OnInit, Input, Inject, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
//import { SlidesOutputData, OwlOptions } from 'ngx-owl-carousel-o';
//import { IMasonryGalleryImage } from 'ngx-masonry-gallery';
import { isPlatformBrowser } from '@angular/common';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { LayoutService } from '../../../services/layout.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-v-show-gallery',
  templateUrl: './v-show-gallery.component.html',
  styleUrls: ['./v-show-gallery.component.scss']
})
export class VShowGalleryComponent implements OnInit {

  private subscription: Subscription;

  loading: boolean = true;
  options: any;
  columns: string;

  // normal slideshow
  isNormal: boolean;

  // masonry
  isMosaic: boolean;
  mosaicImages: any[] = [];

  // slideshow variables
  isSlideshow: boolean;
  carouselData: any[] = [];
  slideshowId: String = 'slide-' + Date.now() + '-' + Math.floor(Math.random() * Math.floor(150));
  carouselPages: any[] = [];
  imageHeightWithoutPixel = 0;

  layoutSize: Number;

  @Input() postId: string;
  @Input() value: string;
  @Input() blockId: string;

  gallery: any[] = [];

  prevSlideshow: boolean;

  @ViewChild('carousel') private carousel : ElementRef;

  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ref: ChangeDetectorRef,
    private _layoutSizeService: LayoutService
  ) {

    this.subscription = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.layoutSize = value;

      if(this.layoutSize < 2) {
        if(this.isSlideshow) {
          this.prevSlideshow = true;

          this.isNormal = true;
          this.isSlideshow = false;
        }        
      }
      else {
        if(this.prevSlideshow) {
          this.isNormal = false;
          this.isSlideshow = true;
          this.prevSlideshow = false;
        }
      }

    });

  }

  ngOnInit(): void {

    this._siteService.getBlockInfo(
      this._hostService.getSiteId(),
      this.postId,
      this.blockId
    ).subscribe((result: any) => {

      if (result.success) {

        $(document).ready(function() {
              $('.carousel').carousel({
                  interval: 3000
              })
        });    

        this.gallery = result.data.options.gallery;
        this.options = result.data.options;
        this.loading = false;


        if(this.options.gallery_image_height) {

          let extractNumber = this.options.gallery_image_height.match(/\d/g);
          extractNumber = extractNumber.join("");

          this.imageHeightWithoutPixel = parseInt(extractNumber) + 100;   // we add 100px because of the lower navigation at the slideshow

          console.log(this.imageHeightWithoutPixel);
          
        }


        if (this.options.gallery_type == 'slideshow') {

          if(this._layoutSizeService.getSize() < 2) {
            this.prevSlideshow = true;
  
            this.isNormal = true;
            this.isSlideshow = false;
          }
          else {

            // slideshow
            this.isSlideshow = true;

          }

          let calculatePages = Math.ceil(this.gallery.length / ((this.options.columns_per_slide) ? this.options.columns_per_slide : 4));
          
          for(let i = 0; i < calculatePages; i++) {
            this.carouselPages.push({
              number: i
            });
          }


          let counter = undefined;
          let sliderNumber = 0;

          for(let i = 0; i < this.gallery.length; i++) {

            // if not only page
            if(calculatePages > 1) {
              if((i % calculatePages == 0) || this.options.columns_per_slide == 1) {

                if(counter == undefined) {
                  counter = 0;
                }
                else {
                  counter++;
                }              

              }    
            }
            else {
              // if only page
              counter = 0;
            }

            if((i / ((this.options.columns_per_slide) * (sliderNumber + 1)) == 1 )) {
              sliderNumber++;
            }

            if(this.carouselPages[sliderNumber]) {

              if(!this.carouselPages[sliderNumber]['slides']) {
                this.carouselPages[sliderNumber]['slides'] = [];
              }

              this.carouselPages[sliderNumber]['slides'].push(this.gallery[i]);

            }

          }

          // we add empty slides to the last slide, so that we have the same number of slides everywhere

          // in case that it's only one in the field
          if(this.carouselPages[sliderNumber] && this.carouselPages[sliderNumber - 1]) {

            let delta = this.carouselPages[sliderNumber - 1].slides.length - this.carouselPages[sliderNumber].slides.length;

            if(delta > 0) {
              
              for(let i = 0; i < delta; i++) {
                this.carouselPages[sliderNumber].slides.push({
                  blank: true
                })
              }

            }
          }


          console.log(this.carouselPages);


        } else if (this.options.gallery_type == 'mosaic') {

          // mosaic

          this.isMosaic = true;

          for (let g of this.gallery) {

            if (g.image && g.image.filename) {
              this.mosaicImages.push({
                imageUrl: '/assets/' + g.image.filename
              });
            }

          }


        } else {
          // normal

          this.isNormal = true;
          

          let _columns = parseInt(this.value);

          if(!isNaN(_columns) && _columns > 0) {            
            this.columns = '-' + 12 / parseInt(this.value);            
          }


        }

      }

    });


  }

  ngOnDestroy() {

    if(this.subscription) {
      this.subscription.unsubscribe();
    }

  }

}
