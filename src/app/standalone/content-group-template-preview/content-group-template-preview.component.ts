import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { ContentType } from '@app/core/models/content-type.enum';
import { LICENSES } from '@app/core/models/licenses';
import { Room } from '@app/core/models/room';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentTemplatePreviewComponent } from '@app/standalone/_dialogs/content-template-preview/content-template-preview.component';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';
import { Subject, takeUntil } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TranslocoService } from '@ngneat/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ViolationReportComponent } from '@app/standalone/_dialogs/violation-report/violation-report.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { EditContentGroupTemplateComponent } from '@app/standalone/_dialogs/edit-content-group-template/edit-content-group-template.component';

@Component({
  standalone: true,
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    TemplateLicenseComponent,
    AddTemplateButtonComponent,
    ClipboardModule,
  ],
  selector: 'app-content-group-template-preview',
  templateUrl: './content-group-template-preview.component.html',
  styleUrls: ['./content-group-template-preview.component.scss'],
})
export class ContentGroupTemplatePreviewComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  template: ContentGroupTemplate;

  room?: Room;
  contents: Content[] = [];
  LICENSES = LICENSES;

  isLoadingContentGroup = true;
  isLoadingContents = true;
  url!: string;
  isCreator = false;

  constructor(
    private templateService: BaseTemplateService,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private translateService: TranslocoService,
    private notificationService: NotificationService,
    private routingService: RoutingService,
    private apiConfigService: ApiConfigService,
    private authService: AuthenticationService
  ) {
    this.template = history?.state?.data?.template;
    this.room = route.snapshot.data.room;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.apiConfigService
      .getApiConfig$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((config) => {
        this.url = this.routingService.getRoute(
          ['t', this.route.snapshot.params['templateId']],
          config
        );
      });
    if (this.template) {
      this.getContentTemplates();
      this.checkIfCreator();
      return;
    }
    this.templateService
      .getContentGroupTemplate(this.route.snapshot.params.templateId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((template) => {
        this.template = template;
        this.getContentTemplates();
        this.checkIfCreator();
      });
  }

  checkIfCreator(): void {
    this.authService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.isCreator = auth.userId === this.template.creatorId;
      });
  }

  getContentTemplates(): void {
    this.isLoadingContentGroup = false;
    this.templateService
      .getContentTemplates(this.template.templateIds)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((contentTemplates) => {
        this.contents = contentTemplates;
        this.isLoadingContents = false;
      });
  }

  getIcon(format: ContentType): string {
    return this.contentService.getTypeIcons().get(format) || '';
  }

  openPreview(content: Content): void {
    this.dialog.open(ContentTemplatePreviewComponent, {
      data: {
        contents: this.contents,
        index: this.contents.map((c) => c.id).indexOf(content.id),
      },
      panelClass: 'big-dialog-panel',
    });
  }

  showNotificationAfterCopiedUrl(): void {
    const msg = this.translateService.translate(
      'templates.template-link-copied'
    );
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
  }

  reportTemplate(): void {
    this.dialog.open(ViolationReportComponent, {
      width: '600px',
      data: {
        targetId: this.template.id,
        targetType: 'ContentGroupTemplate',
      },
    });
  }

  editTemplate(): void {
    this.dialog
      .open(EditContentGroupTemplateComponent, {
        width: '600px',
        data: { template: this.template },
      })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((template) => {
        if (template) {
          this.template = template;
          history.replaceState({ template: this.template }, '');
        }
      });
  }
}
