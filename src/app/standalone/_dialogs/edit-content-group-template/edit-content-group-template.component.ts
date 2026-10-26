import { Component, inject, viewChild } from '@angular/core';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentGroupTemplateEditingComponent } from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { CoreModule } from '@app/core/core.module';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  TemplateDetailsFragment,
  UpdateTemplateGql,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-edit-content-group-template',
  imports: [
    CoreModule,
    LoadingButtonComponent,
    ContentGroupTemplateEditingComponent,
  ],
  templateUrl: './edit-content-group-template.component.html',
})
export class EditContentGroupTemplateComponent extends FormComponent {
  private dialogRef =
    inject<MatDialogRef<EditContentGroupTemplateComponent>>(MatDialogRef);
  data = inject<{
    template: TemplateDetailsFragment;
  }>(MAT_DIALOG_DATA);
  private updateTemplate = inject(UpdateTemplateGql);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  readonly templateEditing = viewChild.required(
    ContentGroupTemplateEditingComponent
  );

  save() {
    const template = this.templateEditing().getTemplate();
    if (!template) {
      return;
    }
    this.disableForm();
    this.updateTemplate
      .mutate({
        variables: { input: { id: this.data.template.id, ...template } },
      })
      .subscribe({
        next: (r) => {
          this.dialogRef.close(r.data?.updateTemplate);
          const msg = this.translateService.translate(
            'templates.changes-saved'
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
