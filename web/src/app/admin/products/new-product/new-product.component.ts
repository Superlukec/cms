import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { AddPropertyDialogComponent } from '../../../utils/add-property-dialog/add-property-dialog.component';
import { AddFeatureDialogComponent } from '../../../utils/add-feature-dialog/add-feature-dialog.component';
import { AddAttachmentDialogComponent } from '../../../utils/add-attachment-dialog/add-attachment-dialog.component';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SlugifyService } from '../../../services/slugify.service';
import { LayoutService } from '../../../services/layout.service';
import { FormCheckerService } from '../../../services/form-checker.service';

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss']
})
export class NewProductComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private subscription2: Subscription;
  private formSubscription: Subscription;

  showOptionSidebar: Boolean;
  layoutSize: Number;

  selectedLang: String;
  multilanguage: any;
  availableLanguages: any;

  brands: any = [];

  loading: Boolean = true;
  productInfo: any = {};
  productHirerachy = [];
  images: any = [];
  features: any = [];
  attachments: any = [];

  allProperties: any = [];
  properties: any = [];

  mainForm: FormGroup;
  submitted = false;

  @Input() id: string;

  filteredProperties: Observable<any[]>;

  propertyDialogRef: MatDialogRef<AddPropertyDialogComponent>;
  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;
  featureDialogRef: MatDialogRef<AddFeatureDialogComponent>;
  attachmentDialogRef: MatDialogRef<AddAttachmentDialogComponent>;

  constructor(
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _dialog: MatDialog,
    private _slugifyService: SlugifyService,
    private _layoutSizeService: LayoutService,
    private _formCheckerService: FormCheckerService,
  ) { 

    this.subscription2 = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.layoutSize = value;

      if(value > 1) {
        this.showSidebar(true);
      }
      else {
        this.showSidebar(false);
      }
    });

  }

  get f() { return this.mainForm.controls; }

  getProductInfo(id: string) {
    var promise = new Promise((resolve, reject) => {

      if (!this.id) {
        resolve(null);
      }
      else {

        this._siteService.getProduct(this._hostService.getSiteId(), this.id).subscribe((result: any) => {

          if (result && result.success) {
            resolve(result.data);
          }
          else {
            resolve(null);
          }

        }, err => {

          if (err.status != 200) {
            // snackbar
            this._snackBar.open('Error', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });

      }

    });
    return promise;
  }

  getProperties(lang) {
    var promise = new Promise((resolve, reject) => {
      this._siteService.getProperties(this._hostService.getSiteId(), lang).subscribe((result: any) => {
        if (result && result.success) {
          resolve(result.data);
        }
        else {
          resolve([]);
        }
      }, err => {
        if (err.status != 200) {
          resolve([]);
        }
      });
    });
    return promise;
  }

  ngOnInit() {

    this.layoutSize = this._layoutSizeService.getSize();

    if(this.layoutSize > 1) {
      this.showSidebar(true);
    }
    else {
      this.showSidebar(false);
    }

    let getSiteInfoHandler = new Promise((resolve, reject) => {
      this._siteService.getPostSiteInfo(this._hostService.getSiteId()).subscribe((result: any) => {
        if (result && result.success) {
          resolve(result.data);
        }
        else {
          resolve([]);
        }
      }, err => {
        if (err.status != 200) {
          resolve([]);
        }
      });
    });


    this.getProductInfo(this.id).then((data: any) => {

      this.productInfo = data;

      getSiteInfoHandler.then((siteInfo: any) => {

        if (siteInfo) {
          this.multilanguage = siteInfo.multilanguage;
          this.availableLanguages = (siteInfo.languages) ? siteInfo.languages : [];

          if(this.productInfo && this.productInfo.lang_prefix) {
            this.selectedLang = this.productInfo.lang_prefix;
          }
          else {

            if (!this.selectedLang && this.availableLanguages.length > 0) {
              for (let lang of this.availableLanguages) {
                if (lang.main) {
                  this.selectedLang = lang.prefix;
                }
              }
            }

          }
        }

        this.getProperties(this.selectedLang).then((properties: []) => {

          this.allProperties = properties;

          this._siteService.getBrands(this._hostService.getSiteId(), this.selectedLang).subscribe((result: any) => {

            if (result.success) {
              this.brands = result.data;

              if (this.brands.length > 0) {

                //this.getProductInfo(this.id).then((data: any) => {

                  let brandId = (!this.productInfo) ? this.brands[0]._id : this.productInfo.brand_id; //this.brands[0]._id;

                  this._siteService.getProductsHierchy(this._hostService.getSiteId(), brandId, (this.id) ? this.id : 'none').subscribe((hierarchy: any) => {

                    this.productHirerachy = hierarchy.data;

                    if (this.productInfo) {                      
                      this.createForm(this.productInfo);
                    }
                    else {
                      this.createForm();
                      this.id = null;
                    }

                    this.loading = false;

                  }, err => {

                    if (err.status != 200) {
                      this._snackBar.open('Error', '', {
                        duration: 2000,
                        panelClass: ['error-snackbar']
                      });
                    }
                  });

                //});

              }
              else {
                /**
                 * If we edit product, the brand should exists (brand cannot be deleted if the product exists)
                 */
                this.loading = false;
              }
            }
            else {
              this.loading = false;
            }



          }, err => {
            if (err.status != 200) {
              this._snackBar.open('Error on the server', '', {
                duration: 2000,
                panelClass: ['error-snackbar']
              });
            }
          });

        });

      });

    });

  }

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {  

    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required],
      slug: [(data && data.slug) ? data.slug : '', Validators.required],
      excerpt: [(data && data.excerpt) ? data.excerpt : '', Validators.required],
      brand_id: [(data && data.brand_id) ? data.brand_id : this.brands[0]._id, Validators.required],
      parent_id: [(data && data.parent_id) ? data.parent_id : 'null', Validators.required],
      description: [(data && data.description) ? data.description : '', Validators.required],
      features: [(data && data.features) ? data.features : []],
      images: [(data && data.images) ? data.images : []],
      attachments: [(data && data.attachments) ? data.attachments : []],
      properties: [(data && data.properties) ? data.properties : []],
      meta_keywords: [(data && data.meta_keywords) ? data.meta_keywords : ''],
      meta_description: [(data && data.meta_description) ? data.meta_description : '']
    });


    if (data && data.images) {
      this.images = data.images;
    }

    if (data && data.features && data.features.length > 0) {

      for(let i = 0; i < data.features.length; i++) {

        data.features[i].index = i;

      }

      this.features = data.features;
    }

    if (data && data.attachments) {
      this.attachments = data.attachments;
    }

    if (data && data.properties) {
      for (let prop of data.properties) {
        for (let p of this.allProperties) {
          if (prop == p._id) {
            p['selected'] = true;
          }
        }
      }
    }


    /**
     * Listen for changes on the title
     */
    this.subscription = this.mainForm.get('name').valueChanges
      .pipe(debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(modelValue => {

        //if(!this.mainForm.get('slug').value) {
        this.mainForm.patchValue({
          'slug': this._slugifyService.convertToSlug(this.mainForm.get('name').value)
        });

        // }         
      });


      this.checkForm();

  }

  checkForm() {

    this.formSubscription = this.mainForm.valueChanges    
    .subscribe(x => {

        this._formCheckerService.formChanged(true);

        this.formSubscription.unsubscribe();

    });

  }

  /**
   * CKEditor - getting the data
   * @param id 
   * @param value 
   */
  onCkEditorValue(value, type) {

    this._formCheckerService.formChanged(true);

    if (type == 'description') {
      this.mainForm.patchValue({
        description: value
      });
    }
    else {
      this.mainForm.patchValue({
        excerpt: value
      });
    }
  }

  /**
   * On image upload module
   * @param html 
   */
  onImageUpload(img) {
    /*
    if(config.development && img.url) {
      img.url = 'http://localhost:1339' + img.url;
    }*/

    console.log(img);

    this.images.push({
      _id: Date.now(),
      file: img._id,
      src: img.url,
      hero: (this.images.length == 0) ? true : false
    })

    this.mainForm.patchValue({
      images: this.images
    });
  }

  /**
   * 
   * @param id 
   */
  addHero(id) {
    for (let file of this.images) {
      if (file._id == id) {
        file.hero = true;
      }
      else {
        file.hero = false;
      }
    }

    this.mainForm.patchValue({
      images: this.images
    });
  }

  /**
   * On delete image module
   * @param id 
   * @param html 
   */
  deleteImage(id) {

    console.log(id);

    this._siteService.deleteFile(this._hostService.getSiteId(), id).subscribe((result: any) => {

      if (result && result.success) {
        for (let i = 0; i < this.images.length; i++) {
          if (this.images[i]._id == id) {
            this.images.splice(i, 1);
          }
        }

        this.mainForm.patchValue({
          images: this.images
        });

      }
      else {
        this._snackBar.open(result.message, '', {
          duration: 2000,
        });
      }

    }, err => {

      if (err.status != 200) {
        // snackbar
        this._snackBar.open('Error', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });

    /*

    for (let i = 0; i < this.images.length; i++) {
      if (this.images[i]._id == id) {
        this.images.splice(i, 1);
      }
    }

    this.mainForm.patchValue({
      images: this.images
    });*/
  }

  changeBrand(brandId) {

    this._siteService.getProductsHierchy(this._hostService.getSiteId(), brandId, (this.id) ? this.id : 'none').subscribe((result: any) => {

      if (result.success) {
        this.productHirerachy = result.data;

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
   * Delete product function
   */
  deleteProduct() {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this product',
          text: 'Are you sure that you want to delete this product?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        // User agrees

        this._siteService.deleteProduct(
          this._hostService.getSiteId(),
          this.id
        ).subscribe((result: any) => {

          if (result.success) {

            this._router.navigate(['admin/products']);

            this._snackBar.open('Deleted', '', {
              duration: 2000,
            });
          }
          else {
            this._snackBar.open('Error. Please try again.', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }


        }, err => {

          if (err.status != 200) {
            // snackbar
            this._snackBar.open('Error', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });

      }

    });

  }

  onSubmit() {

    this.submitted = true;

    console.log('saving / updating product')

    if (this.mainForm.status != "INVALID") {

      let properties = [];
      for (let p of this.allProperties) {
        if (p.selected) {
          properties.push(p._id);
        }
      }

      this.mainForm.patchValue({
        'properties': properties
      });

      let saveService = (!this.id) ? this._siteService.addProduct(
        this._hostService.getSiteId(),
        this.mainForm.value.name,
        this.mainForm.value.brand_id,
        this.mainForm.value.slug,
        this.mainForm.value.description,
        this.mainForm.value.excerpt,
        this.mainForm.value.parent_id,
        this.mainForm.value.features,
        this.mainForm.value.images,
        this.mainForm.value.attachments,
        this.mainForm.value.properties,
        this.mainForm.value.meta_keywords,
        this.mainForm.value.meta_description,
        this.selectedLang
      ) :
        this._siteService.updateProduct(
          this._hostService.getSiteId(),
          this.id,
          this.mainForm.value.name,
          this.mainForm.value.brand_id,
          this.mainForm.value.slug,
          this.mainForm.value.description,
          this.mainForm.value.excerpt,
          this.mainForm.value.parent_id,
          this.mainForm.value.features,
          this.mainForm.value.images,
          this.mainForm.value.attachments,
          this.mainForm.value.properties,
          this.mainForm.value.meta_keywords,
          this.mainForm.value.meta_description,
          this.selectedLang
        );

      saveService.subscribe((result: any) => {

        if (result && result.success) {

          // in case we add product we add new product ID
          if(!this.id) {
            this.id = result.data;
            this._router.navigate(['admin/products/' + this.id]);
          }

          this._formCheckerService.formChanged(false);
          this.checkForm();

          this._snackBar.open('Product saved', '', {
            duration: 2000,
          });
        }
        else {
          this._snackBar.open(result.message, '', {
            duration: 2000,
          });
        }

      }, err => {

        if (err.status != 200) {
          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });

    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

  //#region features
  addFeatureDialog() {
    this.featureDialogRef = this._dialog.open(
      AddFeatureDialogComponent,
      {
        width: '550px',
        data: {
          title: 'Add feature'
        }
      }
    );

    this.featureDialogRef.afterClosed().subscribe(result => {

      if (result) {
        if (!result['_id']) {
          result['_id'] = new Date();
        }

        result['index'] = this.features.length;

        this.features.push(result);

        this.mainForm.patchValue({
          'features': this.features
        });
      }

    });
  }

  editFeature(feature: any) {
    feature['title'] = 'Edit feature';
    console.log('DEBUG here')

    this.featureDialogRef = this._dialog.open(
      AddFeatureDialogComponent,
      {
        width: '550px',
        data: feature
      }
    );

    this.featureDialogRef.afterClosed().subscribe(result => {

      if (result) {
        for (let f of this.features) {
          if (f._id == feature._id) {
            f.icon = result.icon;
            f.name = result.name;
            f.text = result.text;
          }
        }

        this.mainForm.patchValue({
          'features': this.features
        });
      }

    });
  }

  deleteFeature(id: string) {
    let deleted = false;

    for (let i = 0; i < this.features.length; i++) {
      if (this.features[i]._id == id) {
        this.features.splice(i, 1);
        deleted = true;
      }

      if(deleted) {
        this.features[i].index--;
      }
    }

    this.mainForm.patchValue({
      'features': this.features
    });
  }

  changeFeatureSort(newIndex: number, currentIndex: number) {

    if(!isNaN(newIndex)) {
     

      let feature = this.features[currentIndex];

      this.features.splice(currentIndex, 1);
      this.features.splice(newIndex, 0, feature);

    }    

  }
  //#endregion


  addAttachmentDialog() {
    this.attachmentDialogRef = this._dialog.open(
      AddAttachmentDialogComponent,
      {
        width: '550px',
        data: {
          title: 'Add attachment'
        }
      }
    );

    this.attachmentDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.attachments.push(result);

        this.mainForm.patchValue({
          'attachments': this.attachments
        });

      }

    });
  }


  deleteAttachment(id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this attachment',
          text: 'Are you sure that you want to delete this attachment?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        // User agrees
        for (let i = 0; i < this.attachments.length; i++) {
          if (this.attachments[i]._id == id) {
            this.attachments.splice(i, 1);
          }
        }

        this.mainForm.patchValue({
          attachments: this.attachments
        });


      }

    });

  }

  editAttachment(attachmentObject) {
    let data = attachmentObject;
    data['title'] = 'Add attachment';

    this.attachmentDialogRef = this._dialog.open(
      AddAttachmentDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.attachmentDialogRef.afterClosed().subscribe(result => {

      if (result) {

        for (let i = 0; i < this.attachments.length; i++) {
          if (this.attachments[i]._id == attachmentObject._id) {
            this.attachments[i] = result;
          }
        }

        //this.attachments.push(result);

        this.mainForm.patchValue({
          'attachments': this.attachments
        });

      }

    });
  }

  addProperty() {
    let data = {};
    data['multilanguage'] = this.multilanguage;
    data['availableLanguages'] = (this.availableLanguages && this.availableLanguages.length > 0) ? this.availableLanguages : [];

    this.propertyDialogRef = this._dialog.open(
      AddPropertyDialogComponent,
      {
        width: '550px',
        data: data
      }
    );

    this.propertyDialogRef.afterClosed().subscribe(result => {
      if (result) {
        //console.log(result);
        this.allProperties.push(result);
      }
    });
  }


  /**
   * Select box - changing langauge
   * @param lang 
   */
  onChangeLang(lang) {
    this._siteService.getBrands(this._hostService.getSiteId(), this.selectedLang).subscribe((result: any) => {
      if (result.success) {
        this.brands = result.data;

        if (this.brands.length > 0) {

            let brandId = this.brands[0]._id;

            if(lang == this.productInfo.lang_prefix) {
              brandId = this.productInfo.brand_id;
            }

            this.selectedLang = lang;

            this.mainForm.patchValue({
              'brand_id': brandId
            });

            this._siteService.getProductsHierchy(this._hostService.getSiteId(), brandId, (this.id) ? this.id : 'none').subscribe((hierarchy: any) => {

              this.productHirerachy = hierarchy.data;

            }, err => {

              if (err.status != 200) {
                this._snackBar.open('Error', '', {
                  duration: 2000,
                  panelClass: ['error-snackbar']
                });
              }
            });

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

  showSidebar(val: boolean) {
    this.showOptionSidebar = val;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if(this.subscription2) {
      this.subscription2.unsubscribe();
    }

    if(this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

}
