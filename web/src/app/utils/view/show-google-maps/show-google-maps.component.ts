import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-google-maps',
  templateUrl: './show-google-maps.component.html',
  styleUrls: ['./show-google-maps.component.scss']
})
export class ShowGoogleMapsComponent implements OnInit {

  loading: boolean = true;

  @Input() lat: any;
  @Input() lon: any;


  zoom = 12
  center: google.maps.LatLngLiteral

  constructor() { }

  ngOnInit(): void {

    this.center = {
      lat: parseFloat(this.lat),
      lng: parseFloat(this.lon)
    }

    setTimeout(() => {
      this.loading = false;
    }, 500)  // first it was 3000
  }

}
