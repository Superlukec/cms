import { Component, OnInit } from '@angular/core';

import { AuthguardService }      from '../../services/authguard.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(
    private authguardService: AuthguardService
  ) { }

  ngOnInit() {
    this.authguardService.logout();
  }

}
