import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  showSidebar$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  setSidebar(status: boolean) {
    this.showSidebar$.next(status);
  }
}
