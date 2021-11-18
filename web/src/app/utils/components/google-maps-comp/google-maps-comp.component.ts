import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-google-maps-comp',
  templateUrl: './google-maps-comp.component.html',
  styleUrls: ['./google-maps-comp.component.scss']
})
export class GoogleMapsCompComponent implements OnInit {

  lat: string = '';
  lon: string = '';

  @Input() data: any;
  @Output() output = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if(this.data) {

      this.lat = this.data.value;
      
      if(this.data.options) {
        if(this.data.options.lon) {
          this.lon = this.data.options.lon;
        }
      }

    }
  }

  dataChange() {
    console.log(this.lat)
    console.log(this.lon)

    this.output.emit({
      lat: this.lat,
      lon: this.lon
    });  
  }

}
