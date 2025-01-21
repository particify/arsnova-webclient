import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormService } from '@app/core/services/util/form.service';
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
  @ViewChild(ContentGroupTemplateEditingComponent)
  templateEditing!: ContentGroupTemplateEditingComponent;

  constructor(
    protected formService: FormService,
    private dialogRef: MatDialogRef<CreateContentGroupTemplateComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { name: string; contentGroupId: string },
    private templateService: TemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {
    super(formService);
  }

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
