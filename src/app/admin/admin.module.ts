import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { extensions } from './admin.extensions';
import { SharedAdminModule } from './shared-admin.module';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { SummaryBarComponent } from './summary-bar/summary-bar.component';
import { SystemStatusComponent } from './system-status/system-status.component';
import { SystemStatisticsComponent } from './system-statistics/system-statistics.component';
import { RoomManagementComponent } from './room-management/room-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { TRANSLATION_MODULE_NAME } from '@app/translate-module-name-token';
import { TranslateHttpLoaderFactory } from '@app/translate-http-loader-factory';
import { AdminService } from '@core/services/http/admin.service';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { AdminPageHeaderComponent } from './admin-page-header/admin-page-header.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { InputDialogComponent } from './_dialogs/input-dialog/input-dialog.component';
import { HealthStatusComponent } from './health-status/health-status.component';
import { UserSearchComponent } from './user-search/user-search.component';

@NgModule({
  imports: [
    extensions,
    CommonModule,
    AdminRoutingModule,
    CoreModule,
    SharedModule,
    SharedAdminModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient, TRANSLATION_MODULE_NAME],
      },
      isolate: true,
    }),
    ExtensionPointModule,
  ],
  declarations: [
    AdminHomeComponent,
    SummaryBarComponent,
    SystemStatusComponent,
    SystemStatisticsComponent,
    RoomManagementComponent,
    UserManagementComponent,
    AdminPageHeaderComponent,
    SearchBarComponent,
    InputDialogComponent,
    HealthStatusComponent,
    UserSearchComponent,
  ],
  providers: [
    { provide: TRANSLATION_MODULE_NAME, useValue: 'admin' },
    AdminService,
  ],
})
export class AdminModule {}
