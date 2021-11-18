import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-news',
  templateUrl: './show-news.component.html',
  styleUrls: ['./show-news.component.scss']
})
export class ShowNewsComponent implements OnInit {

  @Input() data: any;

  test = [1, 2, 3, 4, 5, 6]

  constructor() { }

  ngOnInit() {
    console.log(this.data);
    console.log('show news componenta')
  }

  meh() {
    this.test.push(this.test.length + 1)
  }
}
