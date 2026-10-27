import { Component, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentGroupTemplateEditingComponent } from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FlexModule } from '@angular/flex-layout';
import { MatButton } from '@angular/material/button';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import {
  CreateTemplateFromQuestionnaireGql,
  TemplateContentAttributionsByQuestionnaireIdGql,
  TemplateLicenseFragment,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { catchError, map, of, startWith } from 'rxjs';

type InheritedLicenseState =
  | { status: 'loading' }
  | { status: 'loaded'; license?: TemplateLicenseFragment }
  | { status: 'failed' };

@Component({
  selector: 'app-create-content-group-template',
  templateUrl: './create-content-group-template.component.html',
  styleUrls: ['./create-content-group-template.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    FlexModule,
    ContentGroupTemplateEditingComponent,
    MatDialogActions,
    MatButton,
    LoadingButtonComponent,
    LoadingIndicatorComponent,
    TranslocoPipe,
  ],
})
export class CreateContentGroupTemplateComponent extends FormComponent {
  private dialogRef =
    inject<MatDialogRef<CreateContentGroupTemplateComponent>>(MatDialogRef);
  data = inject<{
    name: string;
    questionnaireId: string;
  }>(MAT_DIALOG_DATA);
  private createTemplateFromQuestionnaire = inject(
    CreateTemplateFromQuestionnaireGql
  );
  private attributionsByQuestionnaireId = inject(
    TemplateContentAttributionsByQuestionnaireIdGql
  );
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private readonly operations = mutationHelper();

  readonly templateEditing = viewChild(ContentGroupTemplateEditingComponent);

  /**
   * Copies of a licensed template may only be republished under that licence.
   * Fetched fresh, as contents may have been copied since the page loaded.
   * Without the attributions the licence cannot be locked, so a failure
   * keeps the form out rather than offering every licence.
   */
  private readonly inheritedLicenseState = toSignal(
    this.attributionsByQuestionnaireId
      .fetch({
        variables: { questionnaireId: this.data.questionnaireId },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((r) =>
          (r.data?.templateContentAttributionsByQuestionnaireId ?? []).map(
            (a) => a.license
          )
        ),
        this.operations.reportErrors(),
        map((licenses): InheritedLicenseState => ({
          status: 'loaded',
          license: this.findInheritedLicense(licenses),
        })),
        catchError(() => of<InheritedLicenseState>({ status: 'failed' })),
        startWith<InheritedLicenseState>({ status: 'loading' })
      ),
    { requireSync: true }
  );
  readonly isLoading = computed(
    () => this.inheritedLicenseState().status === 'loading'
  );
  readonly loadFailed = computed(
    () => this.inheritedLicenseState().status === 'failed'
  );
  readonly inheritedLicense = computed(() => {
    const state = this.inheritedLicenseState();
    return state.status === 'loaded' ? state.license : undefined;
  });

  /**
   * Contents copied under different licences cannot form a template at all,
   * which the backend reports on creation, so there is nothing to lock then.
   */
  private findInheritedLicense(
    licenses: (TemplateLicenseFragment | null | undefined)[]
  ): TemplateLicenseFragment | undefined {
    const known = licenses.filter((l): l is TemplateLicenseFragment => !!l);
    const ids = new Set(known.map((l) => l.id));
    return ids.size === 1 ? known[0] : undefined;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  publish() {
    // Not rendered unless the inherited licence is known.
    const template = this.templateEditing()?.getTemplate();
    if (!template) {
      return;
    }
    this.disableForm();
    this.createTemplateFromQuestionnaire
      .mutate({
        variables: {
          input: {
            ...template,
            attribution: template.attribution || undefined,
            questionnaireId: this.data.questionnaireId,
          },
        },
      })
      .subscribe({
        next: () => {
          this.closeDialog();
          const msg = this.translateService.translate(
            'templates.template-published'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
        error: () => {
          this.enableForm();
        },
      });
  }
}
