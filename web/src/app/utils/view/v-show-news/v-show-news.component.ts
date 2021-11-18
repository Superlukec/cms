import { Component, OnInit, Input } from '@angular/core';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { ImageService } from '../../../services/image.service';

@Component({
  selector: 'app-v-show-news',
  templateUrl: './v-show-news.component.html',
  styleUrls: ['./v-show-news.component.scss']
})
export class VShowNewsComponent implements OnInit {

  loading: boolean = true;
  posts: any[] = [];

  @Input() id: any;
  @Input() number: any;
  @Input() layout: any;

  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _imageService: ImageService
  ) { }

  ngOnInit(): void {

    this._siteService.getCategoryPostsPublic(this._hostService.getSiteId(), this.id, this.number).subscribe((result: any) => {

      if(result.success) {
        this.loading = true;       
        this.posts = result.data; 
      }
      else {
        this.loading = false;
      }

    }, err => {
        this.loading = false;
    });

  }

}
