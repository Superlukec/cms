import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormCheckerService {
  
  private isChanged: Boolean = false;

  constructor() { }

  formChanged(val: boolean) {
    this.isChanged = val;
  }

  isFormChanged() {
    return this.isChanged;
  }
}
