import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  visible: boolean;

  @Input() html: string;
  @Input() set show(show: boolean) {
    this.visible = show;
  }

  constructor() { }

  ngOnInit() {
  }

}
