import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-insert-news',
  templateUrl: './insert-news.component.html',
  styleUrls: ['./insert-news.component.scss']
})
export class InsertNewsComponent implements OnInit {

  elementId: string = "element-" + Date.now();
  selectedLang: String;

  category_id: String;
  number_of_news: Number = 5;
  layout: String = 'columns';
  
  loading: boolean = true;

  categories: any = [];

  @Input() set lang(lang: string) {
    this.selectedLang = lang;

    this.showNewsCategory(lang);
  }

  @Input() data: any;
  @Output() output = new EventEmitter<any>();

  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
   
    if(this.data) {

      if(this.data.value) {

        this.category_id = this.data.value;

      }

      if(this.data.options && this.data.options.news) {

        if(this.data.options.news.number_of_news != undefined) {
          this.number_of_news = parseInt(this.data.options.news.number_of_news);
        }

        if(this.data.options.news.layout) {
          this.layout = this.data.options.news.layout;
        }
        

      }

    }

    
  }

  showNewsCategory(lang: string) {

    this._siteService.getCategories(this._hostService.getSiteId(), this.selectedLang).subscribe((result: any) => {

      //console.log(result)

      this.loading = false;

      if (result.success) {        

        this.categories = result.data;

        if(this.categories.length > 0) {

          if(!this.category_id) {
            this.category_id = this.categories[0]._id;
          }
        }

        this.dataChange();

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

  dataChange() {
    this.output.emit({
      value: this.category_id,
      news: {
        number_of_news: this.number_of_news,
        layout: this.layout
      }
    });  
  }

}
