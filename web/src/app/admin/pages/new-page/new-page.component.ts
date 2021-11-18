/**
 * Copyright: Luka Semolič
 * Date: 11.10.2019
 */

import { Component, OnInit, Input, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
//import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { isPlatformBrowser } from '@angular/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; 
import { Location } from '@angular/common'; 
import { Subscription } from 'rxjs';

import { SiteService } from '../../../services/site.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { HostnameService } from '../../../services/hostname.service';
import { SlugifyService } from '../../../services/slugify.service';
import { LayoutService } from '../../../services/layout.service';
import { FormCheckerService } from '../../../services/form-checker.service';

import Options from '../../menu-options';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styleUrls: ['./new-page.component.scss']
})
export class NewPageComponent implements OnInit, OnDestroy {

  private subscriptionLayout: Subscription;
  private subscription: Subscription;
  private subscription2: Subscription;
  private formSubscription: Subscription;

  componentsOptions: any[] = [];

  showOptionSidebar: Boolean;

  platformId: Object;
  ckEditorLoaded = false;
  
  selectedLang: String;
  multilanguage: any;
  availableLanguages: any;

  hostname: String;

  @Input() id: string;
  @Input() type: string;

  isPage: Boolean;
  loading: Boolean = true;
  componentsLoading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;

  elements: any = [];
  categories: any = [];
  showElementBox: Boolean[] = [];
  componentClickLock = false;
  sidebarOption: String = null;
  isDeleted: boolean = false;
  featuredImage: any;
  //public Editor = InlineEditor;

  defaultOptionValue: any = {};

  layoutSize: Number;

  /**
   * Option page - sidebar - helper variable
   */
  optionData: any = {};
  optionComponentId: String;
  optionComponentChildId: number;
  optionIsColumn: boolean;


  // backups
  backupVersion: number = 11;   // only - 10 backups are possible
  backups: any[] = [];
  backupVersionChanged: boolean;
  backupVersionSelected: number;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;


  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _router: Router,     
    private _location: Location,
    private _slugifyService: SlugifyService,
    private _layoutSizeService: LayoutService,
    private _formCheckerService: FormCheckerService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.platformId = platformId;

    this.subscriptionLayout = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.layoutSize = value;

      if(value > 1) {
        this.showSidebar(true);
      }
      else {
        this.showSidebar(false);
      }
    });
  }

  ngOnInit(): void {
    
    this.componentsOptions = Options.options;

    this.layoutSize = this._layoutSizeService.getSize();

    if(this.layoutSize > 1) {
      this.showSidebar(true);
    }
    else {
      this.showSidebar(false);
    }
  

    this.hostname = this._hostService.getHostname();

    /**
     * Init values for options
     */
    this.defaultOptionValue = {
      layout: 'normal',
      column_width: '',
      margin: '',
      padding: ''
    }

    this.isPage = (this.type == 'pages') ? true : false;

    this.elements.push({
      _id: Date.now(),
      value: '',
      type: 'paragraph',
      blocks: [],
      options: {}
    });


    let getSiteInfoHandler = this.getSiteInfo(this._hostService.getSiteId());

    getSiteInfoHandler.then((siteInfo: any) => {

      if(siteInfo) {
        this.multilanguage = siteInfo.multilanguage;
        this.availableLanguages = (siteInfo.languages) ? siteInfo.languages : [];

        if(!this.selectedLang && this.availableLanguages.length > 0) {
          for(let lang of this.availableLanguages) {
            if(lang.main) {
              this.selectedLang = lang.prefix;
            }
          }
        }

      }

      let getCategoriesHandler = this.getCategories(this.isPage, this._hostService.getSiteId());

      getCategoriesHandler.then((categories) => {

        /**
         * If post, we resolve categories
         */
        if (!this.isPage) {

          this.categories = categories;
        }

        if (!this.id) {
          this.loading = false;
          this.createForm();
        }
        else {
          /**
           *  we get the data for page
           */

          let getPosts = (this.type == 'pages') ? this._siteService.getPage(this._hostService.getSiteId(), this.id) : this._siteService.getPost(this._hostService.getSiteId(), this.id);

          getPosts.subscribe((result: any) => {

            if (result.success) {

              /**
               * We show user, the selected categories
               */
              let postCats = result.data.category_id;

              if (postCats && postCats.length > 0) {    
                
                for (let i = 0; i < postCats.length; i++) {

                  for (let j = 0; j < this.categories.length; j++) {

                    if (postCats[i] == this.categories[j]._id) {
                      this.categories[j]['checked'] = true;
                    }

                  }

                }

              }

              this.loading = false;
              this.createForm(result.data);

              // We setup the post lang
              if(result.data.lang_prefix) {
                this.selectedLang = result.data.lang_prefix;
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

      });

    });

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));      
      }, 2000)
    }

  }

  /**
   * We create the form
   * @param data
   */
  async createForm(data?) {

    if(data && data.deleted) {
      this.isDeleted = true;
    }

    if(data && data.backup) {
      this.backups = data.backup;
    }

    if(data && data.featured_image) {
      this.featuredImage = data.featured_image;
      console.log(this.featuredImage)
    }

    this.mainForm = this._fb.group({
      title: [(data && data.title) ? data.title : '', Validators.required],
      slug: [(data && data.slug) ? data.slug : '', Validators.required],      
      meta_keywords: [(data && data.meta_keywords) ? data.meta_keywords : ''],
      meta_description: [(data && data.meta_description) ? data.meta_description : ''],
      blocks: this._fb.array([]),
      homepage: [(data && data.homepage) ? data.homepage : false],
      categories: this._fb.array([]),  // for posts
      redirect: (data && data.redirect) ? data.redirect : false,
      redirect_url: (data && data.redirect_url) ? data.redirect_url : '',
      private_page: (data && data.private_page) ? data.private_page : false,
    });

    // we add selected categories - for updating the post
    let categories = <FormArray>this.mainForm.get('categories') as FormArray;
    for (let j = 0; j < this.categories.length; j++) {
      if(this.categories[j].checked) {
        categories.push(new FormControl(this.categories[j]._id))
      }
    }


    if (data && data.blocks) {
      // if we are editing the pages

      this.elements = []; 

      for(let i = 0; i < data.blocks.length; i++) {

        await new Promise(resolve => {
        
          // easier to load ckeditor - without errors
          //setTimeout(() => {
            this.elements.push(data.blocks[i]);

            setTimeout(() => {
              if(data.blocks[i].options) {

                let optionObject = data.blocks[i].options

                for(let key in optionObject) {              
                  this.liveElementChange(data.blocks[i], key, optionObject[key]);
                }

              }
              resolve();
            }, 50)


          //}, 200 * i);

        });

      }
      
      this.componentsLoading = false;

    }
    else {
      // in case we are adding new page
      this.componentsLoading = false;
    }

    
    /**
     * Listen for changes on the title
     */
    this.subscription = this.mainForm.get('title').valueChanges
        .pipe(debounceTime(800),
          distinctUntilChanged()
        )          
        .subscribe(modelValue => {

          if(!this.mainForm.get('slug').value) {
            this.mainForm.patchValue({
              'slug': this._slugifyService.convertToSlug(this.mainForm.get('title').value)
          });            
          
        }         
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

  get f() { return this.mainForm.controls; }

  /**
   * Saving the page
   */
  onSubmit() {

    this.submitted = true;

    console.log('saving / updating page')

    if (this.mainForm.status != "INVALID") {

      if (!this.id) {

        let saveService = (this.type == 'pages') ? 'page' : 'post';


        /**
         * Saving
         */
        this._siteService.addPost(
          this._hostService.getSiteId(),
          this.mainForm.value.slug,
          saveService,
          this.mainForm.value.title,
          this.selectedLang,
          this.elements,
          (this.featuredImage && this.featuredImage._id) ? this.featuredImage._id : null,
          {
            categories: this.mainForm.value.categories,
            meta_keywords: this.mainForm.value.meta_keywords,
            meta_description: this.mainForm.value.meta_description,
            backup_changed: this.backupVersionChanged,
            backup_version: this.backupVersionSelected,
            redirect: this.mainForm.value.redirect,
            redirect_url: this.mainForm.value.redirect_url,
            private_page: this.mainForm.value.private_page,
          }
        ).subscribe((result: any) => {

          if (result.success) {
              
            this._router.navigate(['admin/' + this.type + '/' + result.data]);

            this._formCheckerService.formChanged(false);
            this.checkForm();

            this._snackBar.open('Saved', '', {
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
      else {

        /**
         * Updating
         */
        this._siteService.updatePostContent(
          this._hostService.getSiteId(),
          this.id,
          this.mainForm.value.slug,
          this.mainForm.value.title,
          this.mainForm.value.homepage,
          this.selectedLang,
          this.elements,
          (this.featuredImage && this.featuredImage._id) ? this.featuredImage._id : null,
          {
            categories: this.mainForm.value.categories,
            meta_keywords: this.mainForm.value.meta_keywords,
            meta_description: this.mainForm.value.meta_description,
            backup_changed: this.backupVersionChanged,
            backup_version: this.backupVersionSelected,
            redirect: this.mainForm.value.redirect,
            redirect_url: this.mainForm.value.redirect_url,
            private_page: this.mainForm.value.private_page,
          }
        ).subscribe((result: any) => {

          if (result.success) {

            this._formCheckerService.formChanged(false);
            this.checkForm();

            this._snackBar.open('Page is update', '', {
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

    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
    }


  }

  /**
   * Show dialog for adding components
   */
  addComponent(index: number) {
    this.showElementBox[index] = !this.showElementBox[index];
  }

  /**
   * Add new element
   * @param type 
   */
  addElement(index: number, type: String) {

    this.elements.splice(index + 1, 0, {
      _id: Date.now(),
      value: '',
      type: type,
      blocks: [],
      options: {}
    });

    this.showElementBox[index] = false;
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

    for (let i = 0; i < this.elements.length; i++) {

      if (this.elements[i]._id == elem._id) {
        this.elements.splice(i, 1);
      }

    }

  }

  /**
   * Change column layout - columns
   * @param elem 
   */
  changeColumnLayout(elem) {
    elem['showColumns'] = Date.now();
  }

  /**
   * Drag and drop event
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.elements, event.previousIndex, event.currentIndex);
  }

  /**
   * When adding the data to inner blocks
   * @param data
   */
  onColumnsBlockData(data: any) {

    for (let el of this.elements) {

      if (el._id == data._id || el._id == data.id) {

        el.blocks = data.blocks;
        el.no_columns = data.blocks.length;

      }

    }

  }


  /**
   * Home page maker
   */
  homePageButton() {

    let homePageRequest = (this.mainForm.value.homepage);

    let dialogData = {};

    if (homePageRequest) {
      dialogData = {
        title: 'Are you sure?',
        text: 'That this page becomes homepage?',
        leftButton: 'Cancel',
        rightButton: 'Proceed'
      }
    }
    else {
      dialogData = {
        title: 'You can\'t disable homepage',
        text: 'If you want to change homepage to another page, go to that page and make it homepage.',
        leftButton: 'OK'
      }
    }

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: dialogData,
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        /**
         * User agrees
         */



      }
      else {

        /**
         * User disagrees
         */

        /**
         * We return form value to the default one
         */
        this.mainForm.patchValue({
          homepage: !homePageRequest
        });

      }

    });


  }

  /**
   * CKEditor - getting the data
   * @param id 
   * @param value 
   */
  onCkEditorValue(id, value) {

    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        element.value = value;

      }

    }

  }

  getSiteInfo(site_id) {

    return new Promise((resolve, reject) => {

      this._siteService.getPostSiteInfo(site_id).subscribe((result: any) => {

        if (result.success) {
          resolve(result.data);
        }
        else {

          resolve([]);

          this._snackBar.open('Error: ' + result.message, '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

      }, err => {

        if (err.status != 200) {

          resolve([]);

          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });


    });

  }

  getCategories(is_page, site_id) {

    return new Promise((resolve, reject) => {

      if (is_page) {
        resolve([]);
      }
      else {
        this._siteService.getCategories(site_id).subscribe((result: any) => {

          if (result.success) {
            resolve(result.data);
          }
          else {

            resolve([]);

            this._snackBar.open('Error: ' + result.message, '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }

        }, err => {

          if (err.status != 200) {

            resolve([]);

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

  onChangeCat(event) {
    const categories = <FormArray>this.mainForm.get('categories') as FormArray;

    if (event.checked) {
      categories.push(new FormControl(event.source.value))
    } else {
      const i = categories.controls.findIndex(x => x.value._id === event.source.value._id);
      categories.removeAt(i);
    }
  }

  /**
   * On image upload module
   * @param id 
   * @param html 
   */
  onImageUpload(id, img) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        element.value = img.url;

      }

    }

  }

  /**
   * On delete image module
   * @param id 
   * @param html 
   */
  onDelete(id) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        element.value = null;

      }

    }

  }

  //#region event holders

  /**
   * On HTML image module
   * @param id 
   * @param html 
   */
  onHTMLData(id, html) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        element.value = html;

      }

    }
  }

  /**
   * On news data
   * @param id 
   * @param html 
   */
  onNewsData(id, options) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        element.value = options.value;

        if(!element.options) {
          element.options = {};
        }

        element.options['news'] = options.news;

      }

    }

  }

  /**
   * On product show component
   * @param id 
   * @param html 
   */
  onProductShowSelect(id, productsId) {
    console.log('test')

    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        if(!element.options) {
          element.options = {};
        }

        element.options['products'] = productsId;

      }

    }
  }

  /**
   * On hero show component
   * @param id 
   * @param html 
   */
  onHeroData(id, data) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

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

        element.options['title_color'] = data.title_color;
        element.options['subtitle'] = data.subtitle;
        element.options['subtitle_color'] = data.subtitle_color;
        element.options['size'] = data.size;
        element.options['alignment'] = data.alignment;
        
      }

    }
  }

  onProductOptions(id, data) {

    console.log('Product options')
    console.log(data);

    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        if(!element.options) {
          element.options = {};
        }

        element.options['product_limit'] = data.product_limit;
        element.options['products_per_column'] = data.products_per_column;
        element.options['show_excert'] = data.show_excert;

        element.options['filter'] = data.filter;
        element.options['is_custom_filter'] = data.is_custom_filter;
        element.options['custom_filter'] = data.custom_filter;
        element.options['lang'] = this.selectedLang;

      }

    }
  }

  /**
   * On google maps component
   * @param id 
   * @param html 
   */
  onGoogleMapsData(id, data) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        if(data.lat) {
          element.value = data.lat;
        }
        else {
          element.value = null;
        }

        if(!element.options) {
          element.options = {};
        }

        
        element.options['lon'] = data.lon;
        
      }

    }
  }

  /**
   * On show form component
   * @param id 
   * @param html 
   */
  onFormData(id, data) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

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

    this._formCheckerService.formChanged(true);


    for (let element of this.elements) {

      if (id == element._id) {

        if(data.columns) {
          element.value = data.columns; // št. columns je v value
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
        element.options['gallery_icon_size'] = data.gallery_icon_size;
        element.options['is_cover_image_style'] = data.is_cover_image_style;
        element.options['gallery_type'] = data.gallery_type;
        element.options['mosaic_image_width'] = data.mosaic_image_width;
        element.options['columns_per_slide'] = data.columns_per_slide;
        element.options['show_slideshow_indicator'] = data.show_slideshow_indicator;
        element.options['indicator_color'] = data.indicator_color;        
      }

    }


  }

  onButtonData(id, data) {
    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

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
        element.options['button_icon'] = data.button_icon;        
        element.options['button_fullwidth'] = data.button_fullwidth;
        element.options['button_action'] = data.button_action;
        element.options['button_link'] = data.button_link;
        element.options['button_actionvalue'] = data.button_actionvalue;
        
      }

    }
  }

  onTabsData(id, data) {

    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

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
        
        
        element.options['tabs'] = data;
        
      }

    }
  }

  onTemplateData(id, data) {

    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (id == element._id) {

        element.value = null;
        if(!element.options) {
          element.options = {};
        }

        // we prepare the data
        element.options['template'] = data;
        
      }

    }
  }

  //#endregion


  /**
   * Show option menu when users clicks on component 
   * @param id - component id
   * @param type - component type
   * @param childIndex ??
   */
  blockComponentSelect: boolean;
  isColumn: boolean;

  selectComponent(id, type?, childIndex?, column?:boolean) {
    
    if(!this.blockComponentSelect) {      

      this.isColumn = column;
      this.blockComponentSelect = true;

      /**
       * When clicked on a component, this function will be triggered two times instantly
       */
      if (!this.componentClickLock) {

        this.componentClickLock = true;
        let found = false;

        for (let element of this.elements) {

          if (id == element._id) {

            /**
             * This is for column component - to activate inner component
             */
            if (element.blocks) {
              for (let i = 0; i < element.blocks.length; i++) {
                if (element.blocks[i].selected) {
                  element.blocks[i].selected = null;
                }
              }

              if (childIndex != undefined) {
                if (element.blocks[childIndex]) {
                  element.blocks[childIndex].selected = true;

                  // fix - that's not empty field - width
                  if(element.blocks[childIndex].options) {                       
                    if(!element.blocks[childIndex].options.column_width) {
                      element.blocks[childIndex].options.column_width = '';
                    }           
                    if(!element.blocks[childIndex].options.margin) {
                      element.blocks[childIndex].options.margin = '';
                    }
                    if(!element.blocks[childIndex].options.padding) {
                      element.blocks[childIndex].options.padding = '';
                    }
                  }

                  this.optionData = (element.blocks[childIndex].options) ? element.blocks[childIndex].options : this.defaultOptionValue;
                }
                else {
                  this.optionData = this.defaultOptionValue;
                }
              }
              else {

                // fix - that's not empty field - width
                if(element.options) {
                  if(!element.options.layout) {
                    element.options.layout = 'normal';
                  }      
                  if(!element.options.column_width) {
                    element.options.column_width = '';
                  }           
                  if(!element.options.margin) {
                    element.options.margin = '';
                  }
                  if(!element.options.padding) {
                    element.options.padding = '';
                  }
                  if(!element.options.img_size) {
                    element.options.img_size = '';
                  }
                }

                this.optionData = (element.options) ? element.options : this.defaultOptionValue;
              }
            }

            element.selected = true;
            found = true;
          }
          else {

            if (element.blocks) {

              /**
               * This is for column component - to activate inner component
               */

              for (let i = 0; i < element.blocks.length; i++) {
                if (element.blocks[i].selected) {
                  element.blocks[i].selected = null;
                }
              }

            }

            element.selected = null;
          }

        }

        if (!found) {
          this.optionData = null;
          this.optionData = this.defaultOptionValue;
        }

        // default value for background style if background image is present
        if(this.optionData && this.optionData.background_image) {

          if(!this.optionData.background_style) {
            this.optionData['background_style'] = 'repeat';
          }

        }

        /**
         * Show components for info
         */
        this.showComponentInfo(id, type, childIndex);

        setTimeout(() => {
          this.componentClickLock = false;
          this.blockComponentSelect = false;
        }, 200);

      }

    }

  }

  onBackgroundImage(val) {

    if(!this.optionData) {
      this.optionData = {};
    }

    this.optionData['background_image'] = val.url;

  }

  onDeleteBackgroundImage() {
    if(!this.optionData) {
      this.optionData = {};
    }

    this.optionData['background_image'] = '';
    this.optionData['background_style'] = '';
  }

  /**
   * Open options in sidebar, based on clicked component
   * @param componentId - ID
   * @param componentType - type
   * @param childIndex - index when multiple columns component
   */
  private showComponentInfo(componentId, componentType, childIndex) {    
    
    this.optionComponentId = componentId;
    this.optionComponentChildId = childIndex;

    this.optionIsColumn = (childIndex) ? true : false;
    this.sidebarOption = componentType;
  }

  /**
   * When user clicks inside columns directive - to open option page
   * @param id - id of component
   * @param data - subcomponent info - data.type, data.index 
   */
  onColumnClick(id, data) {    
    this.selectComponent(id, data.type, data.index, true);
  }

  /**
   * Option page variables
   * @param value - variable value
   * @param variableName - variable name
   */
  optionPageValue(value: any, variableName: any) {

    this._formCheckerService.formChanged(true);

    for (let element of this.elements) {

      if (this.optionComponentId == element._id) {

        if (this.optionComponentChildId != undefined) {

          if (!element.blocks[this.optionComponentChildId].options) {
            element.blocks[this.optionComponentChildId].options = {};
          }

          element.blocks[this.optionComponentChildId].options[variableName] = value;

        }
        else {

          if (!element.options) {
            element.options = {};
          }

          element.options[variableName] = value;
        }

        // we also change style inside the editor
        this.liveElementChange(element, variableName, value);
        
      }

    }

  }

  /**
   * Showing live changes inside editor
   * @param elem
   * @param variableName 
   * @param value 
   */
  liveElementChange(elem, variableName, value) {

    // in case of HTML element we ignore
    if(elem.type != 'html') {
      let elemId = elem._id;    
      let domElem = document.getElementById('cont-' + elemId);
      if(domElem) {

          switch(variableName) {

            case 'layout_class': {
              domElem.className = value;
              break;
            }
            case 'box_class': {
              domElem.className = value;
              break;
            }
            case 'background_color': {
              //domElem.style.backgroundColor = value;      
              break;
            }
            case 'background_image': {
              domElem.style.backgroundImage = "url('" + value + "')";    
              break;
            }
            case 'background_style': {
              if(value == 'cover') {
                domElem.style.backgroundRepeat = '';    
                domElem.style.backgroundSize = value;    
              }
              else {
                domElem.style.backgroundSize = ''; 
                domElem.style.backgroundRepeat = value;    
              }
              
              break;
            }
            default: {                      
              break; 
            } 

          }

      }
    }
  }

  /**
   * Select box - changing langauge
   * @param lang 
   */
  onChangeLang(lang) {
    console.log(lang);
  }


  /**
   * Delete page function
   */
  deletePage() {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this page',
          text: 'Are you sure that you want to delete this page?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        // User agrees

        this._siteService.archivePost( //deletePost(
          this._hostService.getSiteId(),
          this.id
        ).subscribe((result: any) => {

          if (result.success) {            

            this._router.navigate(['admin/' + this.type]);

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

  deletePagePerm() {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this page',
          text: 'Are you sure that you want to delete this page (this is irreversible)?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        // User agrees

        this._siteService.deletePost(
          this._hostService.getSiteId(),
          this.id
        ).subscribe((result: any) => {

          if (result.success) {            

            this._router.navigate(['admin/' + this.type]);

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

  /**
   * Copy existing post to new post
   */
  copyToNewDesign() {

    this.id = null;
    
    this.mainForm.patchValue({
      'title': '',
      'slug': '',
      'homepage': false,
      //'categories': this._fb.array([])
    });

    while(this.categories.length != 0) {
      this.categories.pop();
    }

    this._location.go('admin/pages/new');

  }

  showSidebar(val: boolean) {
    this.showOptionSidebar = val;
  }

  //#region backups

  revertBackup(backupIndex: any) {

    if(backupIndex != 11) {

      backupIndex = parseInt(backupIndex);

      this.confirmDialogRef = this._dialog.open(
        ConfirmDialogComponent,
        {
          width: '350px',
          data: {
            title: 'Do you want to revert to this backup?',
            text: 'Until you don\'t click save button, changes will not be saved.',
            leftButton: 'Cancel',
            rightButton: 'Yes, I want to revert'
          }
        }
      );

      this.confirmDialogRef.afterClosed().subscribe(result => {

        if(result) {
          // continue

          this.elements = [];

          let blocks = this.backups[backupIndex].blocks;

          for(let i = 0; i < blocks.length; i++) {

            setTimeout(() => {
              this.elements.push(blocks[i]);
    
              setTimeout(() => {
                if(blocks[i].options) {
    
                  let optionObject = blocks[i].options
    
                  for(let key in optionObject) {              
                    this.liveElementChange(blocks[i], key, optionObject[key]);
                  }
    
                }
              }, 50)
    
    
            }, 200 * i);

          }
          
          let backupSize = this.backups.length;

          // we setup the data
          for(let i = backupIndex; i < backupSize; i++) {
            this.backups.pop();
          }

          this.backupVersionSelected = this.backupVersion;

          this.backupVersion = 11;

          this.backupVersionChanged = true;

        }

      });

    }

  }

  previewBackup(backupIndex: Number) {

    if(backupIndex != 11) {

      this._snackBar.open('Oprosti Ivana, še ne delam =)', '', {
        duration: 2000,
      });

    }
  }

  //#endregion


  onFeaturedImageUpload(img) {
    this._formCheckerService.formChanged(true);
    this.featuredImage = img;
  }

  onFeaturedImageDelete(event) {
    this._formCheckerService.formChanged(true);
    this.featuredImage = null;
  }

  trackByFn(index, item) {
    return index; // or item.id
  }

  ngOnDestroy() {

    this.showElementBox = [];

    if(this.elements.length > 0) {
      while(this.elements.length == 0) {
        this.elements.pop();
      }
    }

    if(this.componentsOptions.length > 0) {
      while(this.componentsOptions.length == 0) {
        this.componentsOptions.pop();
      }
    }

    if(this.backups.length > 0) {
      while(this.backups.length == 0) {
        this.backups.pop();
      }
    }

    if(this.subscriptionLayout) {
      this.subscriptionLayout.unsubscribe();
    }

    if(this.subscription) {
      this.subscription.unsubscribe();
    }

    if(this.subscription2) {
      this.subscription2.unsubscribe();
    }

  }

}
