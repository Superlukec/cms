import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

import { SiteService } from '../../services/site.service';
import { HostnameService } from '../../services/hostname.service';


@Component({
  selector: 'app-preview-theme-variation',
  templateUrl: './preview-theme-variation.component.html',
  styleUrls: ['./preview-theme-variation.component.scss']
})
export class PreviewThemeVariationComponent implements OnInit {

  themeId: string;
  themeVersion: string;

  error: boolean;
  error_msg: string;

  loading: boolean = true;

  header: string;
  footer: string;
  body: string;

  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.themeId = this._route.snapshot.paramMap.get('id');
    this.themeVersion = this._route.snapshot.paramMap.get('index');

    this._siteService.getSiteTemplate(this._hostService.getSiteId(), '/', this.themeId, this.themeVersion).subscribe((result: any) => {


      if(result && result.success) {

        //console.log(result)

        this.header = result.data.header;
        this.footer = result.data.footer;


        this._siteService.resolvePage(this._hostService.getSiteId(), '').subscribe((result: any) => {

          this.loading = false;
  
          if (result.success) {
            this.body = result.data.html;
          }
          else {
            this.body = '<div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut volutpat, sem ut auctor accumsan, nisi orci maximus lectus, a tempus mi diam id lacus. Nullam quis nulla lorem. Vestibulum sodales quam in bibendum feugiat. Quisque non nisi pretium diam facilisis lacinia eu commodo tellus. Nulla iaculis lectus at lacus tincidunt condimentum. Fusce at nisl sit amet urna ultricies dapibus convallis at turpis. Vestibulum condimentum tortor sed pulvinar dignissim. Mauris hendrerit lacinia ipsum ut dictum. Mauris dignissim risus vel mi condimentum laoreet. Etiam sed tellus volutpat, posuere justo laoreet, tincidunt odio. Pellentesque varius efficitur est quis ultrices. Etiam sit amet nunc elit.</div>'
          }
  
        });
          
      }
      else {

        this.loading = false;

        this.error = true;
        this.error_msg = result.message;

      }     

    }, err => {
      if (err.status != 200) {
        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });

  }

}
