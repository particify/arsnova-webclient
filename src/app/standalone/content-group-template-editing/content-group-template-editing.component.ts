import {
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { CoreModule } from '@app/core/core.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { LICENSES } from '@app/core/models/licenses';
import { TemplateTag } from '@app/core/models/template-tag';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormService } from '@app/core/services/util/form.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService } from '@ngneat/transloco';
import { startWith, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [CoreModule],
  selector: 'app-content-group-template-editing',
  templateUrl: './content-group-template-editing.component.html',
  styleUrls: ['./content-group-template-editing.component.scss'],
})
export class ContentGroupTemplateEditingComponent
  extends FormComponent
  implements OnInit
{
  @ViewChildren(MatInput) inputs: QueryList<HTMLInputElement>;

  @Input() name: string = '';
  description: string;
  filteredTags: TemplateTag[] = [];
  selectedTags: TemplateTag[] = [];
  selectedLicense: string;
  selectedLang: string;
  langs: string[];

  licenseKeys = Array.from(LICENSES.keys());
  LICENSES = LICENSES;
  tags: TemplateTag[] = [];

  constructor(
    protected formService: FormService,
    private announceService: AnnounceService,
    private templateService: BaseTemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    this.selectedLicense = this.licenseKeys[0];
    this.selectedLang = this.translateService.getActiveLang();
    this.formGroup = new FormGroup({
      name: new FormControl(this.name, Validators.required),
      description: new FormControl('', Validators.required),
      language: new FormControl(this.selectedLang),
      licenses: new FormControl(this.selectedLicense),
      tags: new FormControl([], Validators.required),
      tag: new FormControl(),
    });
    this.formGroup.valueChanges.pipe(startWith(null)).subscribe((form) => {
      setTimeout(() => {
        this.filteredTags = form?.tag
          ? this.filterTags(form.tag)
          : this.tags.slice();
      });
    });
    this.langs = this.translateService
      .getAvailableLangs()
      .map((lang) => lang.toString());
    this.loadTags();
  }

  replaceDots(key: string): string {
    return key.toLowerCase().replaceAll(/\./g, '-');
  }

  updateLang(lang: string) {
    this.selectedLang = lang;
    this.loadTags();
  }

  updateLicense(license: string) {
    this.selectedLicense = license;
  }

  remove(tag: TemplateTag): void {
    const index = this.selectedTags.map((t) => t.name).indexOf(tag.name);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.announceService.announce('templates.tag-removed', { tag: tag });
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const tag =
      this.filteredTags.length === 0
        ? { name: this.formGroup.get('tag')?.value }
        : this.tags.find((t) => t.name === event.option.viewValue);
    if (tag) {
      this.selectedTags.push(tag);
      this.formGroup.patchValue({ tags: this.selectedTags });
      this.formGroup.patchValue({ tag: '' });
    }
  }

  private filterTags(value: string): TemplateTag[] {
    const filterValue = value.toLowerCase();
    return this.tags.filter((tag) =>
      tag.name.toLowerCase().includes(filterValue)
    );
  }

  loadTags() {
    this.templateService
      .getTemplateTags(this.selectedLang, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tags) => {
        this.tags = tags;
        this.filteredTags = this.tags;
      });
  }

  isTagSelected(tag: TemplateTag) {
    return this.selectedTags.map((t) => t.name).includes(tag.name);
  }

  getTemplate(): ContentGroupTemplate | undefined {
    for (const control in this.formGroup.controls) {
      if (this.formGroup.get(control)?.invalid) {
        this.inputs.find((i) => i.id === control + 'Input')?.focus();
        const msg = this.translateService.translate(
          'templates.please-fill-' + control
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        return;
      }
    }
    const template = new ContentGroupTemplate(
      this.name,
      this.description,
      this.selectedLang,
      this.selectedTags,
      this.selectedLicense
    );
    return template;
  }
}
