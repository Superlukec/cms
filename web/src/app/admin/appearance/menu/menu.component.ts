import { Component, OnInit } from '@angular/core';
import { SiteService } from '../../../services/site.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SlugifyService } from '../../../services/slugify.service';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { HostnameService } from '../../../services/hostname.service';
import { AddPageMenuComponent } from './add-page-menu/add-page-menu.component';
import { FormCheckerService } from '../../../services/form-checker.service';
import { AddMenuCategoryComponent } from './add-menu-category/add-menu-category.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  loading: Boolean = true;
  loadingMenu: Boolean = false;

  selectedMenu: any;
  selectedChild: any;

  currentMenuSelected: string;
  currentMenuName: string;

  allPagesList: any = [];
  allPagesListReadOnly: any = [];

  selectedLang: string;
  multilanguage: any;
  availableLanguages: any;

  currentMenuList: any = [];
  shownMenuList: any = [];  // menu for view  
  menus: any = [];

  newMenuName: string;
  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;
  addPageMenuDialogRef: MatDialogRef<AddPageMenuComponent>;
  addMenuCategoryDialogRef: MatDialogRef<AddMenuCategoryComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _slugifyService: SlugifyService,
    private _hostService: HostnameService,
    private _formCheckerService: FormCheckerService,
  ) { }

  ngOnInit() {

    let getLangInfoHandler = this.getLangInfo(this._hostService.getSiteId());
    getLangInfoHandler.then((langInfo: any) => {

      if (langInfo) {
        this.multilanguage = langInfo.multilanguage;
        this.availableLanguages = langInfo.languages;
        this.selectedLang = langInfo.main_lang_prefix;

        /*
        for(let lang of this.availableLanguages) {
          if(lang.main) {
            this.selectedLang = lang.prefix;
          }
        }*/
      }

      if (!this.currentMenuList[this.currentMenuSelected]) {
        this.currentMenuList[this.currentMenuSelected] = [];
      }

      let promise = this.getAllPagesList(this.selectedLang); 

      promise.then((val) => {

        this._siteService.getAllMenus(this._hostService.getSiteId()).subscribe((result: any) => {

          if (result.success) {

            this.menus = result.data;

            let firstMenu = 'New menu';
            let firstMenuSlug = 'new';

            for (let i = 0; i < this.menus.length; i++) {
              if (i == 0) {
                firstMenu = this.menus[i].name;
                firstMenuSlug = this.menus[i].slug;
              }

              if (!this.currentMenuList[this.menus[i].slug]) {
                this.currentMenuList[this.menus[i].slug] = [];
                this.currentMenuList[this.menus[i].slug][this.selectedLang] = []; // ???
              }

              if (this.menus[i].menu && this.menus[i].menu.length > 0) {

                for (let j = 0; j < this.menus[i].menu.length; j++) {

                  /**
                   * @todo add pages to the menu here
                   */

                  if (this.menus[i].menu[j] && this.menus[i].menu[j].lang_prefix) {

                    for (let k = 0; k < this.menus[i].menu[j].pages.length; k++) {
                      if (!this.currentMenuList[this.menus[i].slug][this.menus[i].menu[j].lang_prefix]) {
                        this.currentMenuList[this.menus[i].slug][this.menus[i].menu[j].lang_prefix] = [];
                      }

                      let menuDetail = this.menus[i].menu[j].pages[k].page_id;
                      if(this.menus[i].menu[j].pages[k].category) {
                        menuDetail = {};
                        menuDetail['_id'] = Date.now() + k;
                        menuDetail['category'] = this.menus[i].menu[j].pages[k].category;
                      }

                      // 2nd level
                      if (this.menus[i].menu[j].pages[k]['children']) {
                        for (let l = 0; l < this.menus[i].menu[j].pages[k]['children'].length; l++) {

                          if (!menuDetail['children']) {
                            menuDetail['children'] = [];
                          }

                          // 3rd level

                          if(this.menus[i].menu[j].pages[k].children[l].page_id) {

                            if (!this.menus[i].menu[j].pages[k].children[l].page_id['children']) {
                              this.menus[i].menu[j].pages[k].children[l].page_id['children'] = [];
                            }

                          }

                          if (this.menus[i].menu[j].pages[k].children[l]['children']) {
                            for (let m = 0; m < this.menus[i].menu[j].pages[k].children[l]['children'].length; m++) {

                              if(this.menus[i].menu[j].pages[k].children[l].page_id) {
                                this.menus[i].menu[j].pages[k].children[l].page_id['children'].push(
                                  this.menus[i].menu[j].pages[k].children[l]['children'][m].page_id
                                );
                              }
                                                           
                            }
                          }

                          let tmp = this.menus[i].menu[j].pages[k].children[l].page_id;
                          if(this.menus[i].menu[j].pages[k].children[l].category) {  
                            
                            tmp = {};                         
                            tmp['_id'] = Date.now() + l;              
                            tmp['category'] = this.menus[i].menu[j].pages[k].children[l].category;
                            tmp['children'] = [];

                            for (let m = 0; m < this.menus[i].menu[j].pages[k].children[l]['children'].length; m++) {
                              tmp['children'].push(
                                this.menus[i].menu[j].pages[k].children[l]['children'][m].page_id
                              )
                            }

                          }

                          menuDetail['children'].push(tmp);

                        }
                      }

                      this.currentMenuList[this.menus[i].slug][this.menus[i].menu[j].lang_prefix].push(menuDetail);
                    }

                  }

                }

              }
            }

            this.currentMenuSelected = firstMenu;
            this.changeMenu({
              name: firstMenu,
              slug: firstMenuSlug
            });


            this.loading = false;


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

      });

    });

  }

  /**
   * Adding menu to the pages list
   * @param pagesList 
   */
  addToMenu(pagesList, level: number) {

    this._formCheckerService.formChanged(true);

    this.allPagesList = pagesList;

    for (let page of this.allPagesList) {
      if (page.selected) {

        if (level == 0) {

          // 1st level

          if (!this.currentMenuList[this.currentMenuSelected][this.selectedLang]) {
            this.currentMenuList[this.currentMenuSelected][this.selectedLang] = [];
          }

          this.currentMenuList[this.currentMenuSelected][this.selectedLang].push(page);

        }
        else if (level == 1) {

          // 2nd level

          let parentMenu = this.currentMenuList[this.currentMenuSelected][this.selectedLang];

          for(let i = 0; i < parentMenu.length; i++) {

            if(parentMenu[i]._id == this.selectedMenu._id) {
              
              if(!parentMenu[i].children) {
                parentMenu[i].children = [];
              }

              parentMenu[i].children.push(page);
              parentMenu[i].selected = true;

              this.selectMenu(parentMenu[i]);

            }
            else {
              parentMenu[i].selected = false;
            }

          }          

        }
        else if (level == 2) {

          // 3rd level

          if (!this.selectedChild.children) {
            this.selectedChild.children = [];
          }

          this.selectedChild.children.push(page);

        }
      }
    }

    this.cleanAllPagesList();

  }

  private resetAllPagesMenu() {

    this.allPagesList = [];

    for (let page of this.allPagesListReadOnly) {
      this.allPagesList.push(page);
    }

  }

  /**
   * Remove pages from all pages list - list for adding the pages
   */
  private cleanAllPagesList() {

    this.shownMenuList = this.currentMenuList[this.currentMenuSelected][this.selectedLang].map(x => Object.assign({}, x));

    /*
    for (let page of this.shownMenuList) {
      for (let i = 0; i < this.allPagesList.length; i++) {

        this.allPagesList[i].selected = false;

        let found = false;

        if (page._id == this.allPagesList[i]._id) {

          found = true;

          page.selected = false;

        }

        
        if (!found) {
          
          // Find children
          
          if (page.children && page.children.length) {

            for (let j = 0; j < page.children.length; j++) {

              if (this.allPagesList[i]) {
                if (this.allPagesList[i]._id == page.children[j]._id) {

                  this.allPagesList.splice(j, 1);

                }
              }

            }

          }
        }


      }

    }*/

  }

  /**
   * Changing between menus
   * @param menuSlug 
   */
  changeMenu(menu) {

    this.selectedMenu = null;

    this.currentMenuSelected = menu.slug;
    this.currentMenuName = menu.name;

    /**
     * @TODO pridobimo iz baze podatke
     */
    if (!this.currentMenuList[this.currentMenuSelected]) {
      this.currentMenuList[this.currentMenuSelected] = [];

      /**
       * Specific to the language
       */
      if (!this.currentMenuList[this.currentMenuSelected][this.selectedLang]) {
        this.currentMenuList[this.currentMenuSelected][this.selectedLang] = [];
      }
    }
    else {

      /**
       * Specific to the language
       */
      if (!this.currentMenuList[this.currentMenuSelected][this.selectedLang]) {
        this.currentMenuList[this.currentMenuSelected][this.selectedLang] = [];
      }
    }

    this.shownMenuList = this.currentMenuList[this.currentMenuSelected][this.selectedLang].map(x => Object.assign({}, x));


    this.resetAllPagesMenu();
    this.cleanAllPagesList();

  }

  /**
   * Adding new menu
   */
  newMenu() {
    this.currentMenuSelected = 'new';
    this.currentMenuName = 'New menu';
  }

  /**
   * Drag and drop event
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.shownMenuList, event.previousIndex, event.currentIndex);

    for (let i = 0; i < this.shownMenuList.length; i++) {
      this.shownMenuList[i].order = i + 1;
    }

    this.currentMenuList[this.currentMenuSelected][this.selectedLang] = this.shownMenuList;

  }

  /**
   * Add new menu
   * @param menuName 
   */
  addNewMenu(menuName) {

    let menuSlug = this._slugifyService.slugify(menuName);

    this._siteService.addNewMenu(this._hostService.getSiteId(), menuName, menuSlug).subscribe((result: any) => {

      if (result.success) {

        /**
         * We redirect to the menu
         */

        // this.currentMenuSelected =

        this.menus.push({
          name: menuName,
          slug: menuSlug,
          _id: result.data
        })

        this.newMenuName = '';

      }
      else {
        this._snackBar.open('Error', result.message, {
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

  /**
   * Saving the menus to the DB
   */
  saveMenus() {

    let menus: any = [];

    for (let key in this.currentMenuList) {

      if (key != undefined && key != 'undefined') {

        let menu: any = [];

        for (let lang in this.currentMenuList[key]) {

          menu.push({
            lang_prefix: lang,
            pages: this.currentMenuList[key][lang]
          });

        }

        menus.push({
          slug: key,
          menu: menu
        })

      }

    }

    this._siteService.addPagesToTheMenus(this._hostService.getSiteId(), menus).subscribe((result: any) => {

      if (result.success) {

        this._formCheckerService.formChanged(false)

        this._snackBar.open('Saved', '', {
          duration: 2000,
        });

      }
      else {
        this._snackBar.open('Error', result.message, {
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

  deleteMenu(_id: string) {
    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this menu?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.deleteMenu(this._hostService.getSiteId(), _id).subscribe((result: any) => {

          if (result.success) {

            for (let i = 0; i < this.menus.length; i++) {

              if (this.menus[i]._id == _id) {
                this.menus.splice(i, 1);
              }

            }

            if (this.menus.length == 0) {
              this.newMenu();
            }
            else {
              this.changeMenu(
                this.menus[0]
              );
            }

          }
          else {
            this._snackBar.open('Error', result.message, {
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
   * Remove page from list
   * @param id 
   */
  removeFromMenuList(id) {    

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this element?',
          note: 'The element will be permanently removed after the Save button',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._formCheckerService.formChanged(true);

        this.selectedMenu = null;

        for (let i = 0; i < this.shownMenuList.length; i++) {

          if (this.shownMenuList[i]._id == id) {

            this.currentMenuList[this.currentMenuSelected][this.selectedLang].splice(i, 1);
            this.shownMenuList.splice(i, 1);

          }

        }

        this.resetAllPagesMenu();
        this.cleanAllPagesList();

      }
    });

  }

  /**
   * Get language info
   * @param site_id 
   */
  getLangInfo(site_id) {

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

  /**
   * Select box
   * @param lang 
   */
  onChangeLang(lang) {
    /**
     * Load right menu for the selected language
     */

    this.loadingMenu = true;

    this.getAllPagesList(lang).then((val) => {

      this.loadingMenu = false;

      this.changeMenu({
        slug: this.currentMenuSelected,
        name: this.currentMenuName
      });


    });



  }

  getAllPagesList(lang) {

    return new Promise((resolve, reject) => {
      this._siteService.getAllPagesList(this._hostService.getSiteId(), lang).subscribe((result: any) => {

        if (result.success) {

          this.allPagesList = result.data.map(x => Object.assign({}, x));
          this.allPagesListReadOnly = result.data.map(x => Object.assign({}, x));

        }
        else {
          this._snackBar.open('Error. Please try again.', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

        resolve();

      }, err => {

        if (err.status != 200) {
          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });

          resolve();
        }
      });

    });

  }


  /**
   * Dialog for adding menus
   */
  addPageToTheMenu() {

    this.resetAllPagesMenu();

    if(this.shownMenuList) {
      let pagesListCount = this.allPagesList.length;

      for(let i = 0; i < pagesListCount; i++) {
        for(let j = 0; j < this.shownMenuList.length; j++) {
          if(this.allPagesList[i] && (this.allPagesList[i]._id == this.shownMenuList[j]._id)) {
            this.allPagesList.splice(i, 1);
            pagesListCount--;
            i--;
          }
        }
      }
    }

    

    this.addPageMenuDialogRef = this._dialog.open(
      AddPageMenuComponent,
      {
        width: '350px',
        data: {
          pagesList: this.allPagesList,
          title: 'Add page'
        }
      }
    );

    this.addPageMenuDialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.addToMenu(result, 0);
      }

    });

  }

  addCategoryToTheMenu(level: number) {

    this._formCheckerService.formChanged(true);

    this.addMenuCategoryDialogRef = this._dialog.open(
      AddMenuCategoryComponent,
      {
        width: '350px',
        data: {
          title: 'Add category'
        }
      }
    );

    this.addMenuCategoryDialogRef.afterClosed().subscribe(result => {

      if (result) {

        let cat = {          
          category: result
        }

        if (level == 0) {

          if (!this.currentMenuList[this.currentMenuSelected][this.selectedLang]) {
            this.currentMenuList[this.currentMenuSelected][this.selectedLang] = [];
          }

          this.currentMenuList[this.currentMenuSelected][this.selectedLang].push(cat);
        }
        else if (level == 1) {

          let parentMenu = this.currentMenuList[this.currentMenuSelected][this.selectedLang];

          for(let i = 0; i < parentMenu.length; i++) {

              if(parentMenu[i]._id == this.selectedMenu._id) {
                
                if(!parentMenu[i].children) {
                  parentMenu[i].children = [];
                }

                parentMenu[i].children.push(cat);

              }
          }
        }

        this.cleanAllPagesList();
      }

    });

  }

  /**
   * Select menu to show options of the menu
   * @param menuId 
   */
  selectMenu(currentMenu) {

    this.selectedChild = null;

    for (let menu of this.shownMenuList) {

      if (menu._id == currentMenu._id) {

        if(menu.children) {
          for(let sub of menu.children) {
            sub.selected = false;
          }
        }

        menu.selected = true;
      }
      else {
        menu.selected = false;
      }

    }

    this.selectedMenu = currentMenu;
  }

  /**
   * Select menu - 2nd level
   * @param currentMenu 
   */
  selectChild(currentMenu) {

    for (let menu of this.selectedMenu.children) {

      if (menu._id == currentMenu._id) {
        menu.selected = true;
      }
      else {
        menu.selected = false;
      }

    }

    
    this.selectedChild = currentMenu;

  }


  addChild() {

    this.resetAllPagesMenu();

    if(this.selectedMenu.children) {
      let pagesListCount = this.allPagesList.length;

      for(let i = 0; i < pagesListCount; i++) {
        for(let j = 0; j < this.selectedMenu.children.length; j++) {
          if(this.allPagesList[i] && (this.allPagesList[i]._id == this.selectedMenu.children[j]._id)) {
            this.allPagesList.splice(i, 1);
            pagesListCount--;
            i--;
          }
        }
      }
    }

    this.addPageMenuDialogRef = this._dialog.open(
      AddPageMenuComponent,
      {
        width: '350px',
        data: {
          pagesList: this.allPagesList,
          title: 'Add child (2nd level)'
        }
      }
    );

    this.addPageMenuDialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.addToMenu(result, 1);
      }
    });
  }

  /**
   * Add third level
   */
  addThirdLevelChild() {

    this.resetAllPagesMenu();

    if(this.selectedChild.children) {
      let pagesListCount = this.allPagesList.length;

      for(let i = 0; i < pagesListCount; i++) {
        for(let j = 0; j < this.selectedChild.children.length; j++) {
          if(this.allPagesList[i] && (this.allPagesList[i]._id == this.selectedChild.children[j]._id)) {
            this.allPagesList.splice(i, 1);
            pagesListCount--;
            i--;
          }
        }
      }
    }

    this.addPageMenuDialogRef = this._dialog.open(
      AddPageMenuComponent,
      {
        width: '350px',
        data: {
          pagesList: this.allPagesList,
          title: 'Add child (3rd level)'
        }
      }
    );

    this.addPageMenuDialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.addToMenu(result, 2);
      }
    });
  }

  /**
   * Remove page from child list
   * @param childId 
   */
  removeChildFromMenuList(childId, level) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this element?',
          note: 'The element will be permanently removed after the Save button',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._formCheckerService.formChanged(true);

        if (level == 1) {
          // 2 level
          this.selectedChild = null;

          for (let menu of this.shownMenuList) {

            if (menu.selected) {

              let i = 0;

              for (let child of menu.children) {

                if (child._id == childId) {
                  menu.children.splice(i, 1);
                }

                i++;

              }

            }

          }
        }
        else if (level == 2) {
          // 3rd level

          for (let menu of this.selectedMenu.children) {

            if (menu.selected) {

              let i = 0;

              for (let child of menu.children) {

                if (child._id == childId) {
                  menu.children.splice(i, 1);
                }

                i++;

              }

            }

          }

        }

      }

    });

  }

  /**
   * Drag and drop event - for child
   * @param event
   */
  dropChild(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.selectedMenu.children, event.previousIndex, event.currentIndex);

    for (let i = 0; i < this.selectedMenu.children.length; i++) {
      this.selectedMenu.children[i].order = i + 1;
    }

    //this.currentMenuList[this.currentMenuSelected][this.selectedLang] = this.shownMenuList;
    //this.currentMenuList[this.currentMenuSelected][this.selectedLang] = this.shownMenuList;

  }

  showChildren(postId, level?) {

    this._siteService.showLinksChild(this._hostService.getSiteId(), postId).subscribe((result: any) => {

      if (result.success) {
       
        if(!level) {
          for (let i = 0; i < this.shownMenuList.length; i++) {

            if (this.shownMenuList[i]._id == postId) {
              this.shownMenuList[i].show_links_menu_children = !this.shownMenuList[i].show_links_menu_children;
            }

          }
        }
        else {
          for (let menu of this.shownMenuList) {

            if (menu.selected) {

              for (let child of menu.children) {

                if (child._id == postId) {
                  child.show_links_menu_children = !child.show_links_menu_children;
                }

              }

            }

          }
        }

      }
      else {
        this._snackBar.open('Error', result.message, {
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


  editCategoryName(id: string, category: string, level: number) {   

    this.addMenuCategoryDialogRef = this._dialog.open(
      AddMenuCategoryComponent,
      {
        width: '350px',
        data: {
          title: 'Edit category',
          category: category
        }
      }
    );

    this.addMenuCategoryDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this._formCheckerService.formChanged(true);

        if (level == 0) {

          /*
          for (let i = 0; i < this.shownMenuList.length; i++) {

            if (this.shownMenuList[i]._id == id) {

              this.currentMenuList[this.currentMenuSelected][this.selectedLang][i].category = result;
              this.shownMenuList[i].category = result;

            }

          }*/

          this.currentMenuList[this.currentMenuSelected][this.selectedLang][id].category = result;
          this.shownMenuList[id].category = result;


        }
        else if (level == 1) {
          //let parentMenu = this.currentMenuList[this.currentMenuSelected][this.selectedLang];

          this.selectedMenu.children[id].category = result;

          //parentMenu[id].category = result;

          /*
          for(let i = 0; i < parentMenu.length; i++) {

            if(parentMenu[i]._id == this.selectedMenu._id) {
              
              parentMenu[i].category = result;

            }

          } */
        }

      }

    });

  }

}
