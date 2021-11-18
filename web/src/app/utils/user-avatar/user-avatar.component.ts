import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit {

  @Input() info: any;
  @Input() width: number;
  
  customWidth: string;
  textColor: String = 'black';

  constructor() { }

  ngOnInit(): void {

    if(this.info) {
      if(this.info.color) {
        this.textColor = this.getContrast(this.info.color);
      }
    }

    if(!isNaN(this.width)) {
      this.customWidth = this.width + 'px';
    }

  }

  getContrast(hexcolor: string): string {

    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === '#') {
      hexcolor = hexcolor.slice(1);
    }
  
    // Convert to RGB value
    let r = parseInt(hexcolor.substr(0,2),16);
    let g = parseInt(hexcolor.substr(2,2),16);
    let b = parseInt(hexcolor.substr(4,2),16);
  
    // Get YIQ ratio
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
    // Check contrast
    return (yiq >= 128) ? 'black' : 'white';
  
  };

}
