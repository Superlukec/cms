import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';


@Component({
  selector: 'app-ckeditor-custom-link-dialog',
  templateUrl: './ckeditor-custom-link-dialog.component.html',
  styleUrls: ['./ckeditor-custom-link-dialog.component.scss']
})
export class CkeditorCustomLinkDialogComponent implements OnInit {

  search: string;
  searchTimeout: boolean = false;

  link: string;
  validLink: boolean;

  loading: boolean = true;
  pagesList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<CkeditorCustomLinkDialogComponent>,
  ) { }

  ngOnInit(): void {


    this._siteService.getLastTenPosts(this._hostService.getSiteId()).subscribe((result: any) => {

      if(result && result.success) {

        this.pagesList = result.data;

        this.loading = false;

      }

    }, err => {

      if (err.status != 200) {
        // snackbar
        this._snackBar.open('Error', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });

        this.loading = false;

      }


    });    
    
  }

  selectPost(index: number) {

    for(let i = 0; i < this.pagesList.length; i++) {

      if(i == index) {
        this.pagesList[i].active = true;
      }
      else {
        this.pagesList[i].active = false;
      }

    }

  }

  selectAndClose(index: number) {
    
    this.sendLink('/' + this.pagesList[index].slug);

  }

  sendLink(link: string) {        

    this._dialogRef.close(link);

  }

  chooseLink():void {

    let valid = false;
    let link = '';

    // input has priority
    if(this.link && this.validLink) {
      link = this.link;
      valid = true;

      return this.sendLink(link);
    }   
    else {
      this._snackBar.open('Please enter valid link', '', {
        duration: 2000,
      });
    } 

    // then we check for links
    if(!valid) {
      for(let i = 0; i < this.pagesList.length; i++) {

        if(this.pagesList[i].active) {

          valid = true;
          link = '/' + this.pagesList[i].slug;

        }
      }

      if(valid) {
        return this.sendLink(link);
      }
      else {
        this._snackBar.open('Please enter/choose link', '', {
          duration: 2000,
        });
      }
    }    

  }

  finishWithLink(link: string) {

    this.validateLink(link);

  }

  private validateLink(link: string) {

    var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    var regex = new RegExp(expression);   

    if (link.match(regex)) {
      this.validLink = true;
    }
    else {
      this.validLink = false;
    }

  }

  
  applyFilter(search: string) {

    //if(!this.searchTimeout) {

      this.searchTimeout = true;
      
      /*
      setTimeout(() => {
        this.searchTimeout = false;
        this.applyFilter(search);
      }, 1500);*/

      let getPosts = (search != '') ? 
        this._siteService.findPost(this._hostService.getSiteId(), search) :
        this._siteService.getLastTenPosts(this._hostService.getSiteId());

      getPosts.subscribe((result: any) => {

        if(result && result.success) {

          this.pagesList = result.data;

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

    //}

    
        
  }
 
}
