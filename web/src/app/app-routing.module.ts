import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageComponent } from './pages/page/page.component';
import { PagesComponent } from './admin/pages/pages.component';
import { HomeComponent } from './admin/home/home.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { LoginComponent } from './pages/login/login.component';
import { AppearanceComponent } from './admin/appearance/appearance.component';
import { UsersComponent } from './admin/users/users.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { FormsComponent } from './admin/forms/forms.component';
import { SettingsComponent } from './admin/settings/settings.component';
import { WebAssetsComponent } from './admin/web-assets/web-assets.component';
import { ShareablesComponent } from './admin/shareables/shareables.component';
import { ProductsComponent } from './admin/products/products.component';
import { AccountSettingsComponent } from './admin/account-settings/account-settings.component';
import { PortalComponent } from './pages/portal/portal.component';
import { InvitationComponent } from './pages/invitation/invitation.component';
import { PreviewThemeVariationComponent } from './pages/preview-theme-variation/preview-theme-variation.component';
import { GoogleMapsComponent } from './admin/modules/google-maps/google-maps.component';
import { GoogleAnalyticsComponent } from './admin/modules/google-analytics/google-analytics.component';
import { TransferComponent } from './admin/transfer/transfer.component';
import { ChatBotComponent } from './admin/modules/chat-bot/chat-bot.component';
import { TemplatesComponent } from './admin/templates/templates.component';

// manage
import { ManageSitesComponent } from './management/manage-sites/manage-sites.component';

import { AuthguardService } from '../app/services/authguard.service';
import { UnderConstructionService } from '../app/services/under-construction.service';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { InstallComponent } from './install/install.component';
import { LogsComponent } from './admin/logs/logs.component';










const routes: Routes = [
  //{ path: '', component: PageComponent },  
  { path: 'logout', component: LogoutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login/:page', component: LoginComponent },
  { path: 'login/:page/:id', component: LoginComponent },
  { path: 'invitation/:id', component: InvitationComponent },  
  {
    path: 'admin', component: HomeComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/account-settings', component: AccountSettingsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/pages', component: PagesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/pages/:subpage', component: PagesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/posts', component: PagesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/posts/categories', component: CategoriesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/posts/categories/:subpage', component: CategoriesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/posts/:subpage', component: PagesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/appearance', component: AppearanceComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/appearance/:subpage', component: AppearanceComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/users', component: UsersComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/users/:userid', component: UsersComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/templates', component: TemplatesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/templates/:templateid', component: TemplatesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/chat', component: ChatBotComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/chat/:chatid', component: ChatBotComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {        
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/forms', component: FormsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/forms/:page', component: FormsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/assets', component: WebAssetsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/assets/:subpage', component: WebAssetsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/products', component: ProductsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/products/:subpage', component: ProductsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/shareables', component: ShareablesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/shareables/:subpage', component: ShareablesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/transfer', component: TransferComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/transfer/:subpage', component: TransferComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'admin/settings', component: SettingsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/settings/:settingsid', component: SettingsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/logs', component: LogsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/logs/:logsid', component: LogsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/google-maps', component: GoogleMapsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },
  {
    path: 'admin/google-analytics', component: GoogleAnalyticsComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard], canDeactivate: [AuthguardService],
    data: {
      permissions: {
        only: ['SUPER_ADMIN', 'ADMIN'],
        except: ['VISITOR'],
        redirectTo: '/admin'
      }
    }
  },  
  {
    path: 'admin/:page', component: HomeComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        except: ['VISITOR'],
        redirectTo: '/login'
      }
    }
  },
  {
    path: 'management/:page', component: ManageSitesComponent, resolve: [AuthguardService], canActivate: [AuthguardService, NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['SUPER_ADMIN'],
        redirectTo: '/admin'
      }
    }
  },
  { path: 'preview/:id', component: PreviewThemeVariationComponent, canActivate: [AuthguardService] },
  { path: 'preview/:id/:index', component: PreviewThemeVariationComponent, canActivate: [AuthguardService] },
  { path: 'portal', component: PortalComponent, canActivate: [AuthguardService] },
  { path: 'portal/:id', component: PortalComponent, canActivate: [AuthguardService] },  
  { path: 'install', component: InstallComponent },
  { path: '404.html', component: NotFoundPageComponent },
  { path: '**', component: PageComponent, canActivate: [UnderConstructionService] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: false, // 'enabled'     - APP_INITIALIZER fix
    scrollPositionRestoration: 'top'    // glede novic
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
