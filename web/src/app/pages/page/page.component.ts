// declare ga as a function to set and sent the events
declare let ga: Function;

import { Component, OnInit, OnDestroy, ComponentFactoryResolver, Inject, PLATFORM_ID, ViewChild, ChangeDetectorRef, Injector, ApplicationRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import { isPlatformBrowser, Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from "rxjs";

import { HostnameService } from '../../services/hostname.service';
import { SiteService } from '../../services/site.service';
import { PageInfoService } from '../../services/page-info.service';

import { ShowNewsComponent } from '../../utils/view/show-news/show-news.component';
import { VShowProductsComponent } from '../../utils/view/v-show-products/v-show-products.component';
import { ShowGoogleMapsComponent } from '../../utils/view/show-google-maps/show-google-maps.component';
import { VShowFormComponent } from '../../utils/view/v-show-form/v-show-form.component';
import { MyButtonComponent } from '../../utils/view/my-button/my-button.component';
import { VShowNewsComponent } from '../../utils/view/v-show-news/v-show-news.component';
import { VShowTabsComponent } from '../../utils/view/v-show-tabs/v-show-tabs.component';
import { VShowGalleryComponent } from '../../utils/view/v-show-gallery/v-show-gallery.component';



let componentInfo = {
  '[app-show-news]': ShowNewsComponent,
  '[app-v-show-products]': VShowProductsComponent,
  '[app-show-google-maps]': ShowGoogleMapsComponent,
  '[app-v-show-form]': VShowFormComponent,
  '[my-button]': MyButtonComponent,
  '[app-v-show-news]': VShowNewsComponent,
  '[app-v-show-tabs]': VShowTabsComponent,
  '[app-v-show-gallery]': VShowGalleryComponent
}

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  loading: Boolean = true;
  html: string;

  pageInfo: any;
  product: any;

  compReferences = [];


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _siteService: SiteService,
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _hostService: HostnameService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef,
    private injector: Injector,
    private appRef: ApplicationRef,
    private _titleService: Title,
    private _pageInfoService: PageInfoService,
    private _metaService: Meta,
    private _location: Location
  ) {

    // subscribe to router events and send page views to Google Analytics
    this._router.events.subscribe(event => {

      if (isPlatformBrowser(this.platformId)) {

        if (event instanceof NavigationEnd) {

          // @todo - for first time it doesn't get the analytics so fast (need to create listener)
          setTimeout(() => {
            ga('set', 'page', event.urlAfterRedirects);
            ga('send', 'pageview');
          }, 1000)


        }

      }

    });

  }

  ngOnInit() {

    this.subscription = this._route.url.subscribe((data) => {

      let url = '';
      
      /**
       * Data typeof UrlSegment (array)
       */
      for (let d of data) {
        url += d.path + '/';
      }

      /**
       * Remove last slash
       */
      url = url.substring(0, url.length - 1);

      let exceptions = ['http', 'mailto', 'tel'];
      let exceptionFound = false;

      for (let i = 0; i < exceptions.length; i++) {
        if (!exceptionFound && (url.indexOf(exceptions[i]) != -1)) {
          exceptionFound = true;
        }
      }

      if (!exceptionFound) {
        this.loading = true;

        //#region link


        /**
          * Check if the first segment is the key for language
          */

        this._siteService.resolvePage(this._hostService.getSiteId(), url).subscribe((result: any) => {

          if (result.success) {

            this._pageInfoService.createLink(
              (!result.post) ? 'product' : result.data.type, result.data._id
            );

            if (result.post) {

              if (result.data.redirect) {
                if (isPlatformBrowser(this.platformId)) {
                  if (result.data.redirect_url) {
                    window.location.href = result.data.redirect_url;
                  }
                }
              }


              this.product = false;

              if (result.data) {
                this.pageInfo = result.data;
              }

              if (result.data) {

                if (result.data.title) {
                  // add page title
                  this._titleService.setTitle(result.data.title);
                }

                if (result.data.meta_description) {
                  // meta description
                  this._metaService.addTags([
                    { name: 'description', content: result.data.meta_description }
                  ], true);
                }

                if (result.data.meta_keywords) {
                  // meta keywords
                  this._metaService.addTags([
                    { name: 'keywords', content: result.data.meta_keywords }
                  ], true);
                }

              }

              /**
               * We check if the platform is browser of server --- because document.** don't work if not browser
               */
              if (!isPlatformBrowser(this.platformId)) {
                this.loading = false;
                this.html = result.data.html;
              }
              else {

                /**
                 * Is platform browser - then we compile the components
                 */


                let tmpHtml = result.data.html;  // temporariy variable for changing the html           

                /**
                 * [component]
                 */

                let foundElements = [];
                let match, re = /\[.*?\]/g;


                while (match = re.exec(tmpHtml)) {
                  let original = match[0];    // we keep this variable for later removal of this string

                  let comVariables = [];

                  /**
                   * We check for the shortcode paramaters
                   */
                  let tmp = match[0].split(" ");
                  if (tmp.length > 1) {
                    // parameters (the first should be name of the function)
                    match[0] = tmp[0] + ']';  // because split function returns [shortcode, we need to add the final ] so that the code looks like [shortcode]
                    for (let i = 1; i < tmp.length; i++) {
                      let extractQuotes = tmp[i].split('"');
                      let variable = extractQuotes[0].substring(0, extractQuotes[0].length - 1);
                      let value = extractQuotes[1];

                      comVariables.push({
                        variable: variable,
                        value: value
                      })

                    }
                  }

                  /**
                   * We add the data to the array of all occuring components
                   */
                  foundElements.push({
                    component: match[0],
                    replaceElement: original,
                    id: 'container-' + Math.ceil(Math.random() * Math.floor(10000)),
                    firstIndex: match.index,
                    lastIndex: re.lastIndex,
                    variables: comVariables
                  });

                }


                /**
                 * We remove shortocodes and replace them with containers <div id="unique-id"></div>
                 */
                let realHTML = '';

                if (foundElements.length) {
                  for (let i = 0; i < foundElements.length; i++) {

                    let firstPart = tmpHtml.slice((i == 0) ? i : foundElements[i].firstIndex, (foundElements[i + 1]) ? foundElements[i + 1].firstIndex : tmpHtml.length);

                    firstPart = firstPart.replace(foundElements[i].replaceElement, '<div id="' + foundElements[i].id + '"></div>');

                    realHTML += firstPart;

                  }
                }

                /**
                 * We load the HTML
                 */
                this.loading = false;
                this.html = (realHTML) ? realHTML : tmpHtml;

                this.changeDetectorRef.detectChanges();       // we need to refresh the DOM

                /**
                 * Now we insert the components in the right place
                 */
                if (foundElements.length) {
                  for (let i = 0; i < foundElements.length; i++) {
                    let element = document.getElementById(foundElements[i].id);
                    if (element && componentInfo[foundElements[i].component]) {
                      /**
                       * Inject the component
                       */
                      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentInfo[foundElements[i].component]);//adItem.component);              
                      let compRef = componentFactory.create(this.injector, [], element);

                      element.removeAttribute('ng-version');  // remove the angular version

                      /**
                       * We add the variables to the compononent
                       */
                      if (foundElements[i].variables && foundElements[i].variables.length > 0) {
                        for (let j = 0; j < foundElements[i].variables.length; j++) {
                          compRef.instance[foundElements[i].variables[j].variable] = foundElements[i].variables[j].value;
                        }
                      }

                      /**
                       * We add new compontent to the application's reference - without this, inserted component will not work
                       */
                      this.appRef.attachView(compRef.hostView);
                      this.compReferences.push(compRef)
                    }
                  }
                }


              }

            }
            else {
              this.loading = false;
              this.product = result.data;
            }


          }
          else {
            /**
             * We don't alter history
             */
            this._router.navigate(['404.html'], { replaceUrl: true });
          }

        }, err => {
          if (err.status != 200) {
            this._snackBar.open('Error on the server', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });


        //#endregion

      }      

    });

  }

  onGenerated() {
    //console.log('bazinga');
  }

  ngAfterViewInit() {
    console.log('Zaključeno generiranje spletne strani')
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    /**
     * We remove all references for newly created components
     */

    if (!this.compReferences) {
      while (this.compReferences != null) {
        if (this.compReferences[0] && this.compReferences[0].hostView) {
          this.appRef.detachView(this.compReferences[0].hostView);
        }
        this.compReferences.shift();
      }
    }

  }

}
