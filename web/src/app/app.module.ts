import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { NgxPermissionsModule } from 'ngx-permissions';
//import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
//import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxUploaderModule } from 'ngx-uploader';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxFilesizeModule } from 'ngx-filesize';
import { ClipboardModule } from 'ngx-clipboard';
import { GoogleMapsModule } from '@angular/google-maps';
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { ImageCropperModule } from 'ngx-image-cropper';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageComponent } from './pages/page/page.component';
import { HomeComponent } from './admin/home/home.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { AdminMenuComponent } from './layout/admin-menu/admin-menu.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { PagesComponent } from './admin/pages/pages.component';
import { NewPageComponent } from './admin/pages/new-page/new-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColumnsComponent } from './utils/components/columns/columns.component';
import { ColumnsDialogComponent } from './utils/components/dialog/columns-dialog/columns-dialog.component';
import { LoginComponent } from './pages/login/login.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { ThemesComponent } from './admin/appearance/themes/themes.component';
import { ConfigureThemeComponent } from './admin/appearance/configure-theme/configure-theme.component';
import { MenuComponent } from './admin/appearance/menu/menu.component';
import { AppearanceComponent } from './admin/appearance/appearance.component';
import { ConfirmDialogComponent } from './utils/confirm-dialog/confirm-dialog.component';

import { HttpOptionsService } from './services/http-options.service';
import { HostnameService } from './services/hostname.service';
import { LoadDataService } from './services/load-data.service';
import { AuthentificationService } from './services/authentification.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthguardService } from './services/authguard.service';
import { SiteService } from './services/site.service';
import { UsersComponent } from './admin/users/users.component';
import { CkeditorComponent } from './utils/helpers/ckeditor/ckeditor.component';
import { CkeditorLoaderService } from './utils/ckeditor/ckeditor-loader.service';
import { UnderConstructionService } from './services/under-construction.service';
import { PageInfoService } from './services/page-info.service';
import { SidebarService } from './services/sidebar.service';
import { LayoutService } from './services/layout.service';
import { FaviconService } from './services/favicon.service';

import { RouteDirective } from './directives/route.directive';
import { NewUserComponent } from './admin/users/new-user/new-user.component';
import { UserRoleComponent } from './utils/user-role/user-role.component';
import { PasswordComponent } from './utils/password/password.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { NewCategoryComponent } from './admin/categories/new-category/new-category.component';
import { UploadImageComponent } from './utils/components/upload-image/upload-image.component';
import { UploadFileComponent } from './utils/components/upload-file/upload-file.component';
import { FormsComponent } from './admin/forms/forms.component';
import { ResizableDirective } from './directives/resizable.directive';
import { SettingsComponent } from './admin/settings/settings.component';
import { TranslationsComponent } from './admin/settings/translations/translations.component';
import { GeneralSettingsComponent } from './admin/settings/general-settings/general-settings.component';
import { AddLanguageComponent } from './admin/settings/general-settings/add-language/add-language.component';
import { WithoutSaveDialogComponent } from './utils/without-save-dialog/without-save-dialog.component';
import { NewFormComponent } from './admin/forms/new-form/new-form.component';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { GenerateHTMLDirective } from './directives/generate-html.directive';
import { NewFormElementDialogComponent } from './admin/forms/new-form/new-form-element-dialog/new-form-element-dialog.component';
import { FileExplorerComponent } from './utils/file-explorer/file-explorer.component';
import { WebAssetsComponent } from './admin/web-assets/web-assets.component';
import { ShareablesComponent } from './admin/shareables/shareables.component';
import { InsertHtmlComponent } from './utils/components/insert-html/insert-html.component';
import { AddPageMenuComponent } from './admin/appearance/menu/add-page-menu/add-page-menu.component';
import { InsertNewsComponent } from './utils/components/insert-news/insert-news.component';
import { ShowNewsComponent } from './utils/view/show-news/show-news.component';
import { ProductsComponent } from './admin/products/products.component';
import { BrandsComponent } from './admin/products/brands/brands.component';
import { NewProductComponent } from './admin/products/new-product/new-product.component';
import { BrandDialogComponent } from './utils/brand-dialog/brand-dialog.component';
import { ShowProductsComponent } from './admin/products/show-products/show-products.component';
import { InsertProductsComponent } from './utils/components/insert-products/insert-products.component';
import { VShowProductsComponent } from './utils/view/v-show-products/v-show-products.component';
import { PublicShowProductComponent } from './utils/public/public-show-product/public-show-product.component';
import { AddFeatureDialogComponent } from './utils/add-feature-dialog/add-feature-dialog.component';
import { SelectIconComponent } from './utils/select-icon/select-icon.component';
import { AddAttachmentDialogComponent } from './utils/add-attachment-dialog/add-attachment-dialog.component';
import { PropertiesComponent } from './admin/products/properties/properties.component';
import { AddPropertyDialogComponent } from './utils/add-property-dialog/add-property-dialog.component';
import { AccountSettingsComponent } from './admin/account-settings/account-settings.component';
import { InsertHeroComponent } from './utils/components/insert-hero/insert-hero.component';
import { ShowPagesComponent } from './admin/pages/show-pages/show-pages.component';
import { ForgotPasswordComponent } from './pages/login/forgot-password/forgot-password.component';
import { ShowLoginComponent } from './pages/login/show-login/show-login.component';
import { ResetPasswordComponent } from './pages/login/reset-password/reset-password.component';
import { ShowCategoriesComponent } from './admin/categories/show-categories/show-categories.component';
import { ShowUsersComponent } from './admin/users/show-users/show-users.component';
import { PublicShowMenuChildrenComponent } from './utils/public/public-show-menu-children/public-show-menu-children.component';
import { NewShareableComponent } from './admin/shareables/new-shareable/new-shareable.component';
import { ViewShareablesComponent } from './admin/shareables/view-shareables/view-shareables.component';
import { PortalComponent } from './pages/portal/portal.component';
import { ShowPortalShareablesComponent } from './pages/portal/show-portal-shareables/show-portal-shareables.component';
import { ShowPortalSpecificShareableComponent } from './pages/portal/show-portal-specific-shareable/show-portal-specific-shareable.component';
import { ShowShareableUsersComponent } from './admin/shareables/show-shareable-users/show-shareable-users.component';
import { AddUserDialogComponent } from './utils/add-user-dialog/add-user-dialog.component';
import { InvitationComponent } from './pages/invitation/invitation.component';
import { LargeCodeDialogComponent } from './utils/large-code-dialog/large-code-dialog.component';
import { UploadFileDialogComponent } from './utils/upload-file-dialog/upload-file-dialog.component';
import { RevertThemeDialogComponent } from './utils/revert-theme-dialog/revert-theme-dialog.component';
import { PreviewThemeVariationComponent } from './pages/preview-theme-variation/preview-theme-variation.component';
import { CookieSettingsComponent } from './admin/settings/cookie-settings/cookie-settings.component';
import { LoadCookieTemplateDialogComponent } from './utils/load-cookie-template-dialog/load-cookie-template-dialog.component';
import { ShowSiteCookiesComponent } from './layout/show-site-cookies/show-site-cookies.component';
import { GoogleMapsComponent } from './admin/modules/google-maps/google-maps.component';
import { GoogleMapsCompComponent } from './utils/components/google-maps-comp/google-maps-comp.component';
import { ShowGoogleMapsComponent } from './utils/view/show-google-maps/show-google-maps.component';
import { ShowFormComponent } from './utils/components/show-form/show-form.component';
import { VShowFormComponent } from './utils/view/v-show-form/v-show-form.component';
import { ShowFormsComponent } from './admin/forms/show-forms/show-forms.component';
import { FormSubmissionsComponent } from './admin/forms/form-submissions/form-submissions.component';
import { ExistingFileComponent } from './utils/components/existing-file/existing-file.component';
import { MyButtonComponent } from './utils/view/my-button/my-button.component';
import { TransferComponent } from './admin/transfer/transfer.component';
import { NewTransferComponent } from './admin/transfer/new-transfer/new-transfer.component';
import { ViewTransferComponent } from './admin/transfer/view-transfer/view-transfer.component';
import { ImageSettingsComponent } from './admin/settings/image-settings/image-settings.component';
import { AddImageSizeDialogComponent } from './admin/settings/image-settings/add-image-size-dialog/add-image-size-dialog.component';
import { TruncateTextPipe } from './pipes/truncate-text.pipe';
import { ImageDimensionDialogComponent } from './utils/file-explorer/image-dimension-dialog/image-dimension-dialog.component';
import { ProductSettingsComponent } from './admin/products/product-settings/product-settings.component';
import { SendInquiryDialogComponent } from './utils/public/send-inquiry-dialog/send-inquiry-dialog.component';
import { ManageSitesComponent } from './management/manage-sites/manage-sites.component';
import { ManageShowSitesComponent } from './management/manage-sites/manage-show-sites/manage-show-sites.component';
import { GoogleAnalyticsComponent } from './admin/modules/google-analytics/google-analytics.component';
import { DashShowQuickStatsComponent } from './admin/home/stats/dash-show-quick-stats/dash-show-quick-stats.component';
import { LiveViewComponent } from './admin/home/live-view/live-view.component';
import { ChatBotComponent } from './admin/modules/chat-bot/chat-bot.component';
import { ChattingComponent } from './admin/modules/chat-bot/chatting/chatting.component';
import { ChatSettingsComponent } from './admin/modules/chat-bot/chat-settings/chat-settings.component';
import { ChatRoomComponent } from './admin/modules/chat-bot/chat-room/chat-room.component';
import { ChatbotLiveComponent } from './pages/chatbot-live/chatbot-live.component';
import { ChatbotBoxComponent } from './pages/chatbot-live/chatbot-box/chatbot-box.component';
import { WorkingHoursDialogComponent } from './admin/modules/chat-bot/chat-settings/working-hours-dialog/working-hours-dialog.component';
import { LeadingZeroPipe } from './pipes/leading-zero.pipe';
import { LoadChatbotTemplateDialogComponent } from './utils/load-chatbot-template-dialog/load-chatbot-template-dialog.component';
import { CkeditorCustomLinkDialogComponent } from './utils/helpers/ckeditor-custom-link-dialog/ckeditor-custom-link-dialog.component';
import { InstallComponent } from './install/install.component';
import { AddGalleryComponent } from './utils/components/add-gallery/add-gallery.component';
import { SelectIconDialogComponent } from './utils/select-icon-dialog/select-icon-dialog.component';
import { AddButtonComponent } from './utils/components/add-button/add-button.component';
import { VShowNewsComponent } from './utils/view/v-show-news/v-show-news.component';
import { AddTabsComponent } from './utils/components/add-tabs/add-tabs.component';
import { VShowTabsComponent } from './utils/view/v-show-tabs/v-show-tabs.component';
import { VShowGalleryComponent } from './utils/view/v-show-gallery/v-show-gallery.component';
import { TrashBinViewerComponent } from './admin/trash-bin-viewer/trash-bin-viewer.component';
import { AddCategoryPropertyDialogComponent } from './utils/add-category-property-dialog/add-category-property-dialog.component';
import { AddFilterComponentsDialogComponent } from './utils/components/insert-products/add-filter-components-dialog/add-filter-components-dialog.component';
import { ShowCategoryPropertiesDialogComponent } from './admin/products/properties/show-category-properties-dialog/show-category-properties-dialog.component';
import { UserAvatarComponent } from './utils/user-avatar/user-avatar.component';
import { LogsComponent } from './admin/logs/logs.component';
import { SearchBoxComponent } from './utils/search-box/search-box.component';
import { AddMenuCategoryComponent } from './admin/appearance/menu/add-menu-category/add-menu-category.component';
import { TemplatesComponent } from './admin/templates/templates.component';
import { NewTemplateComponent } from './admin/templates/new-template/new-template.component';
import { ShowTemplatesComponent } from './admin/templates/show-templates/show-templates.component';
import { AddTemplateComponent } from './utils/components/add-template/add-template.component';

//import { ProductCategoriesComponent } from './admin/product-categories/product-categories.component';

export function UserloadProviderFactory(provider: LoadDataService) {
  
  /*
  console.log('Deaktiviram')

  if (typeof window !== 'undefined') {
    let elem: any = document.querySelector('.browserupgrade');
    if(elem) {
      elem.parentNode.removeChild(elem);
    }

   
    setTimeout(() => {
      let elemPreloader: any = document.querySelector('.main-preloader');
      if(elemPreloader) {
        elemPreloader.parentNode.removeChild(elemPreloader);
      }
      
      let elem2: any = document.querySelector('.main-body');
      if(elem2) {
        elem2.classList.remove('main-body');
      }
    }, 2000)   

  }
  */

  //return () => provider.load();
  return (): Promise<any> => { 
    return provider.load();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    AdminMenuComponent,
    NotFoundPageComponent,
    PagesComponent,
    NewPageComponent,
    ColumnsComponent,
    ColumnsDialogComponent,
    LoginComponent,
    LogoutComponent,
    AppearanceComponent,
    ConfirmDialogComponent,
    ThemesComponent,
    ConfigureThemeComponent,
    MenuComponent,
    UsersComponent,
    CkeditorComponent,
    RouteDirective,
    NewUserComponent,
    UserRoleComponent,
    PasswordComponent,
    CategoriesComponent,
    NewCategoryComponent,
    UploadImageComponent,
    UploadFileComponent,
    FormsComponent,
    ResizableDirective,
    SettingsComponent,
    TranslationsComponent,
    GeneralSettingsComponent,
    AddLanguageComponent,
    WithoutSaveDialogComponent,
    NewFormComponent,
    SanitizeHtmlPipe,
    GenerateHTMLDirective,
    NewFormElementDialogComponent,
    FileExplorerComponent,
    WebAssetsComponent,
    ShareablesComponent,
    InsertHtmlComponent,
    AddPageMenuComponent,
    InsertNewsComponent,
    ShowNewsComponent,
    ProductsComponent,
    BrandsComponent,
    NewProductComponent,
    BrandDialogComponent,
    ShowProductsComponent,
    InsertProductsComponent,
    VShowProductsComponent,
    PublicShowProductComponent,
    AddFeatureDialogComponent,
    SelectIconComponent,
    AddAttachmentDialogComponent,
    PropertiesComponent,
    AddPropertyDialogComponent,
    AccountSettingsComponent,
    InsertHeroComponent,
    ShowPagesComponent,
    ForgotPasswordComponent,
    ShowLoginComponent,
    ResetPasswordComponent,
    ShowCategoriesComponent,
    ShowUsersComponent,
    PublicShowMenuChildrenComponent,
    NewShareableComponent,
    ViewShareablesComponent,
    PortalComponent,
    ShowPortalShareablesComponent,
    ShowPortalSpecificShareableComponent,
    ShowShareableUsersComponent,
    AddUserDialogComponent,
    InvitationComponent,
    LargeCodeDialogComponent,
    UploadFileDialogComponent,
    RevertThemeDialogComponent,
    PreviewThemeVariationComponent,
    CookieSettingsComponent,
    LoadCookieTemplateDialogComponent,
    ShowSiteCookiesComponent,
    GoogleMapsComponent,
    GoogleMapsCompComponent,
    ShowGoogleMapsComponent,
    ShowFormComponent,
    VShowFormComponent,
    ShowFormsComponent,
    FormSubmissionsComponent,
    ExistingFileComponent,
    MyButtonComponent,
    TransferComponent,
    NewTransferComponent,
    ViewTransferComponent,
    ImageSettingsComponent,
    AddImageSizeDialogComponent,
    TruncateTextPipe,
    ImageDimensionDialogComponent,
    ProductSettingsComponent,
    SendInquiryDialogComponent,
    ManageSitesComponent,
    ManageShowSitesComponent,
    GoogleAnalyticsComponent,
    DashShowQuickStatsComponent,
    LiveViewComponent,
    ChatBotComponent,
    ChattingComponent,
    ChatSettingsComponent,
    ChatRoomComponent,
    ChatbotLiveComponent,
    ChatbotBoxComponent,
    WorkingHoursDialogComponent,
    LeadingZeroPipe,
    LoadChatbotTemplateDialogComponent,
    CkeditorCustomLinkDialogComponent,
    InstallComponent,
    AddGalleryComponent,
    SelectIconDialogComponent,
    AddButtonComponent,
    VShowNewsComponent,
    AddTabsComponent,
    VShowTabsComponent,
    VShowGalleryComponent,
    TrashBinViewerComponent,
    AddCategoryPropertyDialogComponent,
    AddFilterComponentsDialogComponent,
    ShowCategoryPropertiesDialogComponent,
    UserAvatarComponent,
    LogsComponent,
    SearchBoxComponent,
    AddMenuCategoryComponent,
    TemplatesComponent,
    NewTemplateComponent,
    ShowTemplatesComponent,
    AddTemplateComponent
    //ProductCategoriesComponent 
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    NgxPermissionsModule.forRoot(),
    //CKEditorModule,
    BrowserAnimationsModule,
    MatDialogModule,
    DragDropModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressBarModule,
    NgxUploaderModule,
    ColorPickerModule,
    MatSliderModule,
    MatTabsModule,
    NgxFilesizeModule,
    ClipboardModule,
    MatAutocompleteModule,
    MatSortModule,
    //MatMenuModule,
    GoogleMapsModule,
    InfiniteScrollModule,
    ImageCropperModule
  ],
  providers: [    
    LoadDataService,
    CookieService,
    AuthentificationService,
    HttpOptionsService,
    AuthguardService,
    SiteService,
    CkeditorLoaderService,
    HostnameService,
    UnderConstructionService,
    PageInfoService,
    SidebarService,
    LayoutService,
    FaviconService,
    { provide: APP_INITIALIZER, useFactory: UserloadProviderFactory, deps: [LoadDataService], multi: true }    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
