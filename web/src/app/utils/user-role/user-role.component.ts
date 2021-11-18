import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss']
})
export class UserRoleComponent implements OnInit {

  selectedRole: String = '3';

  @Input() role: string;
  @Output() change = new EventEmitter<any>();

  constructor() {    
  }

  ngOnInit() {
    if(this.role != undefined) {
      this.selectedRole = this.role;
    }
  }

  onChange($event) {
    this.change.emit(this.selectedRole);
  }

}
