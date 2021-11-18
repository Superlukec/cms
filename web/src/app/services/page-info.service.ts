import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageInfoService {

  promiseHide: Boolean;

  link: string;
  link$ = new BehaviorSubject<string>('');

  login$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  createLink(type: string, id: string) {

    if(id) {
      if(type == 'product') {
        this.link = '/admin/products/' + id
      }
      else if(type == 'page') {
        this.link = '/admin/pages/' + id
      } 
      else if(type == 'post') {
        this.link = '/admin/posts/' + id
      }

      this.link$.next(this.link);
    }
 
  }

  hideHeader() { 
    this.promiseHide = true;
    this.login$.next(true);
  }

  showHeader() {  
    //if(!this.promiseHide) {      
      this.login$.next(false);
    //}
    //else {
    //  this.promiseHide = false;
    //}
  }
  
}
