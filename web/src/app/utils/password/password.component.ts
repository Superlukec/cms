import { Component, OnInit, Output, EventEmitter, OnDestroy, Input  } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit, OnDestroy  {

  cssClass: string;

  selectedPassword: String;
  passwordVisible: boolean = false;
  
  private passwordModelChanged: Subject<string> = new Subject<string>();
  private passwordModelChangeSubscription: Subscription

  @Input() password: String;
  @Input() set inputClass(val) {
    this.cssClass = val;
  }
 
  @Output() change = new EventEmitter<any>();  

  constructor() { }

  ngOnInit() {

    if(this.password) {
      this.selectedPassword = this.password;
    }

    this.passwordModelChangeSubscription = this.passwordModelChanged
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(newText => {
        this.selectedPassword = newText;
        this.change.emit(this.selectedPassword);
      });

  }

  ngOnDestroy() {
    this.passwordModelChangeSubscription.unsubscribe();
  }

  changeVisible(visible: boolean) {
     this.passwordVisible = visible;
  }

  generatePassword() {
    this.passwordVisible = true;
    this.selectedPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!.").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    this.change.emit(this.selectedPassword);
  }

}
