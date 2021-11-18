import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-insert-hero',
  templateUrl: './insert-hero.component.html',
  styleUrls: ['./insert-hero.component.scss']
})
export class InsertHeroComponent implements OnInit {

  title: string = 'Big title';  
  titleColor: string;
  
  subtitle: string = '';
  subtitleColor: string;

  size: string = 'display-1';
  alignment: string = 'default';

  @Input() data: any;
  @Output() output = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if(this.data) {
      this.title = this.data.value;
      
      if(this.data.options) {
        if(this.data.options.title_color) {
          this.titleColor = this.data.options.title_color;
        }
        if(this.data.options.subtitle) {
          this.subtitle = this.data.options.subtitle;
        }
        if(this.data.options.subtitle_color) {
          this.subtitleColor = this.data.options.subtitle_color;
        }
        if(this.data.options.size) {
          this.size = this.data.options.size;
        }
        if(this.data.options.alignment) {
          this.alignment = this.data.options.alignment;
        }
      }
    }
  }

  dataChange() {
    this.output.emit({
      title: this.title,
      title_color: this.titleColor,
      subtitle: this.subtitle,
      subtitle_color: this.subtitleColor,
      size: this.size,
      alignment: this.alignment
    });  
  }

}
