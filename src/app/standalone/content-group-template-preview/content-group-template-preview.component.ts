import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentTemplatePreviewComponent } from '@app/standalone/_dialogs/content-template-preview/content-template-preview.component';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';
import {
  EMPTY,
  Observable,
  catchError,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ViolationReportComponent } from '@app/standalone/_dialogs/violation-report/violation-report.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { EditContentGroupTemplateComponent } from '@app/standalone/_dialogs/edit-content-group-template/edit-content-group-template.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import { QuestionnaireInfoComponent } from '@app/standalone/questionnaire-info/questionnaire-info.component';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';
import {
  ContentDetailsFragment,
  ContentType,
  DeleteTemplateGql,
  QuestionnairePublishedContentsByQuestionnaireIdGql,
  TemplateByIdGql,
  TemplateDetailsFragment,
} from '@gql/generated/graphql';
import { ErrorClassification } from '@gql/helper/handle-operation-error';

@Component({
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    TemplateLicenseComponent,
    AddTemplateButtonComponent,
    ClipboardModule,
    QuestionnaireInfoComponent,
    BackButtonComponent,
  ],
  selector: 'app-content-group-template-preview',
  templateUrl: './content-group-template-preview.component.html',
  styleUrls: ['./content-group-template-preview.component.scss'],
})
export class ContentGroupTemplatePreviewComponent {
  private templateById = inject(TemplateByIdGql);
  private publishedContentsByQuestionnaireId = inject(
    QuestionnairePublishedContentsByQuestionnaireIdGql
  );
  private deleteTemplateGql = inject(DeleteTemplateGql);
  private contentService = inject(ContentService);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private routingService = inject(RoutingService);
  private apiConfigService = inject(ApiConfigService);
  private authService = inject(AuthenticationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  // Route data input below
  readonly roomId = input<string>();
  readonly shortId = input<string>();
  readonly templateId = input.required<string>();

  readonly template = toSignal(
    toObservable(this.templateId).pipe(
      switchMap((id) => this.watchTemplate(id))
    )
  );

  private readonly questionnaireId = computed(
    () => this.template()?.questionnaireId
  );
  private readonly loadedContents = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) =>
        questionnaireId ? this.fetchContents(questionnaireId) : EMPTY
      )
    )
  );
  readonly contents = computed(() => this.loadedContents() ?? []);
  readonly isLoadingContents = computed(
    () => this.loadedContents() === undefined
  );

  readonly url = toSignal(
    toObservable(this.templateId).pipe(
      switchMap((id) =>
        this.apiConfigService
          .getApiConfig$()
          .pipe(
            map((config) => this.routingService.getRoute(['t', id], config))
          )
      )
    ),
    { initialValue: '' }
  );
  readonly isGuest = toSignal(
    this.authService
      .getCurrentAuthentication()
      .pipe(map((auth) => !auth?.verified)),
    { initialValue: false }
  );

  private watchTemplate(id: string): Observable<TemplateDetailsFragment> {
    // A template deleted from this page goes missing once it was shown.
    let shown = false;
    return this.templateById.watch({ variables: { id } }).valueChanges.pipe(
      tap((r) => {
        if (!shown && (r.error || r.data?.templateById === null)) {
          this.leaveMissingTemplate(r.error);
        }
      }),
      catchError((error) => {
        this.leaveMissingTemplate(error);
        return EMPTY;
      }),
      map((r) => r.data?.templateById),
      filter((t): t is TemplateDetailsFragment => !!t),
      tap(() => (shown = true))
    );
  }

  private fetchContents(
    questionnaireId: string
  ): Observable<ContentDetailsFragment[]> {
    return this.publishedContentsByQuestionnaireId
      .fetch({ variables: { questionnaireId } })
      .pipe(
        map(
          (r) =>
            r.data?.questionnairePublishedContentsByQuestionnaireId?.edges?.flatMap(
              (e) => (e?.node ? [e.node as ContentDetailsFragment] : [])
            ) ?? []
        ),
        catchError((error) => {
          console.error('Template contents query failed', error);
          return of([]);
        })
      );
  }

  private leaveMissingTemplate(error?: unknown): void {
    const notFound = {
      message: this.translateService.translate('templates.template-not-found'),
      type: AdvancedSnackBarTypes.WARNING,
    };
    if (error) {
      this.notificationService.showOnRequestClientError(error, {
        [ErrorClassification.NotFound]: notFound,
      });
    } else {
      this.notificationService.showAdvanced(notFound.message, notFound.type);
    }
    this.router.navigate(['templates']);
  }

  getIcon(format: ContentType): string {
    return this.contentService.getTypeIcons().get(format) || '';
  }

  openPreview(content: ContentDetailsFragment): void {
    this.dialog.open(ContentTemplatePreviewComponent, {
      data: {
        contents: this.contents(),
        index: this.contents()
          .map((c) => c.id)
          .indexOf(content.id),
        lang: this.template()?.language,
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
        targetId: this.templateId(),
        targetType: 'ContentGroupTemplate',
      },
    });
  }

  editTemplate(): void {
    this.dialog.open(EditContentGroupTemplateComponent, {
      width: '600px',
      data: { template: this.template() },
    });
  }

  deleteTemplate(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-group-template',
      'dialog.really-delete-template',
      undefined,
      undefined,
      () =>
        this.deleteTemplateGql.mutate({
          variables: { id: this.templateId() },
          update: (cache, result) => {
            if (result.data?.deleteTemplate) {
              const cacheId = cache.identify({
                __typename: 'Template',
                id: this.templateId(),
              });
              if (cacheId) {
                cache.evict({ id: cacheId });
                cache.gc();
              }
            }
          },
        })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['templates']);
        const msg = this.translateService.translate(
          'templates.template-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      }
    });
  }
}
