import { Component, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TemplateService } from '@app/creator/_services/template.service';
import { ContentGroupTemplateEditingComponent } from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-create-content-group-template',
  templateUrl: './create-content-group-template.component.html',
  styleUrls: ['./create-content-group-template.component.scss'],
  standalone: false,
})
export class CreateContentGroupTemplateComponent extends FormComponent {
  private dialogRef =
    inject<MatDialogRef<CreateContentGroupTemplateComponent>>(MatDialogRef);
  data = inject<{
    name: string;
    contentGroupId: string;
  }>(MAT_DIALOG_DATA);
  private templateService = inject(TemplateService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  @ViewChild(ContentGroupTemplateEditingComponent)
  templateEditing!: ContentGroupTemplateEditingComponent;

  closeDialog(): void {
    this.dialogRef.close();
  }

  publish() {
    const template = this.templateEditing.getTemplate();
    if (!template) {
      return;
    }
    this.disableForm();
    this.templateService
      .addContentGroupTemplate(template, this.data.contentGroupId)
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
