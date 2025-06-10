import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { extensions } from './admin.extensions';
import { SharedAdminModule } from './shared-admin.module';
import { CoreModule } from '@app/core/core.module';
import { TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { SummaryBarComponent } from './summary-bar/summary-bar.component';
import { SystemStatusComponent } from './system-status/system-status.component';
import { SystemStatisticsComponent } from './system-statistics/system-statistics.component';
import { RoomManagementComponent } from './room-management/room-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AdminService } from '@app/core/services/http/admin.service';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { AdminPageHeaderComponent } from './admin-page-header/admin-page-header.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { InputDialogComponent } from './_dialogs/input-dialog/input-dialog.component';
import { HealthStatusComponent } from './health-status/health-status.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { TemplateManagementComponent } from '@app/admin/template-management/template-management.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateService } from '@app/admin/template-management/template.service';
import { NavigationDrawerComponent } from '@app/standalone/navigation-drawer/navigation-drawer.component';
import { ReportManagementComponent } from '@app/admin/report-management/report-management.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

@NgModule({
  imports: [
    extensions,
    AdminRoutingModule,
    CoreModule,
    SharedAdminModule,
    TranslocoModule,
    ExtensionPointModule,
    LoadingButtonComponent,
    TemplateLanguageSelectionComponent,
    NavigationDrawerComponent,
    LoadingIndicatorComponent,
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
    TemplateManagementComponent,
    ReportManagementComponent,
  ],
  providers: [
    provideTranslocoScope('admin'),
    AdminService,
    TemplateService,
    DialogService,
  ],
})
export class AdminModule {}
