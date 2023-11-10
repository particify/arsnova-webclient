import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { FormService } from '@app/core/services/util/form.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-add-template-button',
  standalone: true,
  imports: [CoreModule, LoadingButtonComponent],
  templateUrl: './add-template-button.component.html',
})
export class AddTemplateButtonComponent extends FormComponent {
  @Input() templateId: string;
  @Input() roomId?: string;
  @Output() templateSelected = new EventEmitter<void>();

  constructor(
    protected formService: FormService,
    private templateService: BaseTemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {
    super(formService);
  }

  use() {
    if (this.roomId) {
      this.disableForm();
      this.templateService
        .createCopyFromContentGroupTemplate(this.templateId, this.roomId)
        .subscribe({
          next: () => {
            const msg = this.translateService.translate(
              'templates.template-added'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.templateSelected.emit();
          },
          error: () => {
            this.enableForm();
          },
        });
    }
  }
}
