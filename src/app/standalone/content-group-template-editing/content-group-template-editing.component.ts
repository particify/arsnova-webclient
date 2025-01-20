import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { CoreModule } from '@app/core/core.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { LICENSES } from '@app/core/models/licenses';
import { TemplateTag } from '@app/core/models/template-tag';
import { FormService } from '@app/core/services/util/form.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  imports: [
    CoreModule,
    TemplateLanguageSelectionComponent,
    TemplateTagSelectionComponent,
  ],
  selector: 'app-content-group-template-editing',
  templateUrl: './content-group-template-editing.component.html',
  styleUrls: ['./content-group-template-editing.component.scss'],
})
export class ContentGroupTemplateEditingComponent
  extends FormComponent
  implements OnInit
{
  @ViewChildren(MatInput) inputs!: QueryList<MatInput>;
  @ViewChild(TemplateTagSelectionComponent)
  templateTagSelectionComponent!: TemplateTagSelectionComponent;

  @Input() name: string = '';
  @Input() template?: ContentGroupTemplate;
  description = '';
  attribution?: string = '';
  aiGenerated = false;
  selectedTags: TemplateTag[] = [];
  selectedLicense: string;
  selectedLang: string;
  langChanged = new EventEmitter<string>();

  licenseKeys = Array.from(LICENSES.keys());
  LICENSES = LICENSES;

  constructor(
    protected formService: FormService,
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {
    super(formService);
    this.selectedLicense = this.licenseKeys[0];
    this.selectedLang = this.translateService.getActiveLang();
  }

  ngOnInit(): void {
    if (this.template) {
      this.name = this.template.name;
      this.description = this.template.description;
      this.attribution = this.template.attribution;
      this.aiGenerated = this.template.aiGenerated;
      this.selectedTags = this.template.tags;
      this.selectedLicense = this.template.license;
      this.selectedLang = this.template.language;
    }
    this.formGroup = new FormGroup({
      name: new FormControl(this.name, Validators.required),
      description: new FormControl(this.description, Validators.required),
      attribution: new FormControl(this.attribution),
      licenses: new FormControl(this.selectedLicense),
    });
  }

  replaceDots(key: string): string {
    return key.toLowerCase().replaceAll(/\./g, '-');
  }

  updateLanguage(lang: string): void {
    this.selectedLang = lang;
    this.langChanged.emit(this.selectedLang);
  }

  updateLicense(license: string): void {
    this.selectedLicense = license;
    if (this.selectedLicense !== this.licenseKeys[0]) {
      this.formGroup.get('attribution')?.addValidators(Validators.required);
    } else {
      this.formGroup.get('attribution')?.clearValidators();
    }
    this.formGroup.get('attribution')?.updateValueAndValidity();
  }

  updateTags(tags: TemplateTag[]): void {
    this.selectedTags = tags;
  }

  getTemplate(): ContentGroupTemplate | undefined {
    let invalidInputName: string | undefined;
    for (const control in this.formGroup.controls) {
      if (this.formGroup.get(control)?.invalid && !invalidInputName) {
        this.inputs.find((i) => i.id === control + 'Input')?.focus();
        invalidInputName = control;
      }
    }
    if (this.selectedTags.length === 0 && !invalidInputName) {
      this.templateTagSelectionComponent.tagInput.nativeElement.focus();
      invalidInputName = 'tags';
    }
    if (invalidInputName) {
      const msg = this.translateService.translate(
        'templates.please-fill-' + invalidInputName
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    const template = new ContentGroupTemplate(
      this.name,
      this.description,
      this.selectedLang,
      this.selectedTags,
      this.selectedLicense,
      this.aiGenerated,
      this.attribution
    );
    return template;
  }
}
