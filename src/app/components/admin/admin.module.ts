import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { extensions } from './admin.extensions';
import { SharedAdminModule } from './shared-admin.module';
import { EssentialsModule } from '../essentials/essentials.module';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { SummaryBarComponent } from './summary-bar/summary-bar.component';
import { SystemStatusComponent } from './system-status/system-status.component';
import { SystemStatisticsComponent } from './system-statistics/system-statistics.component';
import { RoomManagementComponent } from './room-management/room-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { TRANSLATION_MODULE_NAME } from '../../translate-module-name-token';
import { TranslateHttpLoaderFactory } from '../../translate-http-loader-factory';
import { AdminService } from '../../services/http/admin.service';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  imports: [
    extensions,
    CommonModule,
    AdminRoutingModule,
    EssentialsModule,
    SharedModule,
    SharedAdminModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (TranslateHttpLoaderFactory),
        deps: [
          HttpClient,
          TRANSLATION_MODULE_NAME
        ]
      },
      isolate: true
    }),
    MatSidenavModule
  ],
  declarations: [
    AdminHomeComponent,
    SummaryBarComponent,
    SystemStatusComponent,
    SystemStatisticsComponent,
    RoomManagementComponent,
    UserManagementComponent,
  ],
  providers: [
    { provide: TRANSLATION_MODULE_NAME, useValue: 'admin' },
    AdminService
  ],
  exports: [
    MatSidenavModule
  ]
})
export class AdminModule {

}
