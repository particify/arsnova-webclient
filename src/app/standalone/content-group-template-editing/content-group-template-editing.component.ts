import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { CoreModule } from '@app/core/core.module';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import {
  TemplateDetailsFragment,
  TemplateLicenseFragment,
  TemplateLicensesGql,
  TemplateTagFragment,
} from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';

/** The only licence that does not require an attribution. */
const PUBLIC_DOMAIN_LICENSE_ID = 'CC0-1.0';

export interface TemplateFormValue {
  aiGenerated: boolean;
  attribution: string;
  description: string;
  language: string;
  /** Only set while publishing a template that has no licence yet. */
  licenseId?: string;
  name: string;
  published: boolean;
  tagNames: string[];
}

@Component({
  imports: [
    CoreModule,
    TemplateLanguageSelectionComponent,
    TemplateTagSelectionComponent,
    SettingsSlideToggleComponent,
  ],
  selector: 'app-content-group-template-editing',
  templateUrl: './content-group-template-editing.component.html',
  styleUrls: ['./content-group-template-editing.component.scss'],
})
export class ContentGroupTemplateEditingComponent
  extends FormComponent
  implements OnInit
{
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private templateLicenses = inject(TemplateLicensesGql);

  readonly inputs = viewChildren(MatInput);
  readonly templateTagSelection = viewChild(TemplateTagSelectionComponent);

  readonly name = input('');
  readonly template = input<TemplateDetailsFragment>();
  /**
   * The licence the contents were copied under. A new template made from them
   * has to keep it.
   */
  readonly inheritedLicense = input<TemplateLicenseFragment>();

  readonly aiGenerated = linkedSignal(
    () => this.template()?.aiGenerated ?? false
  );
  readonly published = linkedSignal(() => this.template()?.published ?? false);
  readonly selectedLang = linkedSignal(
    () => this.template()?.language ?? this.translateService.getActiveLang()
  );
  readonly selectedTags = linkedSignal<TemplateTagFragment[]>(() => [
    ...(this.template()?.tags ?? []),
  ]);

  private readonly loadedLicenses = toSignal(
    this.templateLicenses
      .fetch()
      .pipe(map((r) => r.data?.templateLicenses ?? []))
  );
  readonly licenses = computed(() => {
    const licenses = this.loadedLicenses() ?? [];
    const current = this.getFixedLicense();
    // A retired licence is no longer selectable but stays set on the template.
    return current && !licenses.some((l) => l.id === current.id)
      ? [current, ...licenses]
      : licenses;
  });
  readonly selectedLicense = linkedSignal<string | undefined>(() => {
    const fixed = this.getFixedLicense();
    if (fixed) {
      return fixed.id;
    }
    const licenses = this.licenses();
    return (
      licenses.find((l) => l.id === PUBLIC_DOMAIN_LICENSE_ID) ?? licenses[0]
    )?.id;
  });

  constructor() {
    super();
    effect(() => {
      const license = this.selectedLicense();
      untracked(() => this.applyLicense(license));
    });
  }

  ngOnInit(): void {
    const template = this.template();
    this.formGroup = new FormGroup({
      name: new FormControl(template?.name ?? this.name(), Validators.required),
      description: new FormControl(
        template?.description ?? '',
        Validators.required
      ),
      attribution: new FormControl(template?.attribution ?? ''),
      licenses: new FormControl(this.selectedLicense()),
    });
    this.applyLicense(this.selectedLicense());
  }

  /** Only a new template inherits a licence; an existing one keeps its own. */
  getInheritedLicense(): TemplateLicenseFragment | undefined {
    return this.template() ? undefined : this.inheritedLicense();
  }

  private getFixedLicense(): TemplateLicenseFragment | undefined {
    return this.template()?.license ?? this.getInheritedLicense();
  }

  /** Re-enabling the form after a failed request keeps the licence locked. */
  protected override handleFormChanges(): void {
    super.handleFormChanges();
    this.lockLicense();
  }

  private lockLicense(): void {
    if (this.getFixedLicense()) {
      this.formGroup.get('licenses')?.disable();
    }
  }

  getLicenseName(id?: string): string | undefined {
    return this.licenses().find((l) => l.id === id)?.name;
  }

  isAttributionOptional(): boolean {
    return this.selectedLicense() === PUBLIC_DOMAIN_LICENSE_ID;
  }

  replaceDots(key: string): string {
    return key.toLowerCase().replaceAll(/\./g, '-');
  }

  /**
   * The language selection reports its initial language too; only a real
   * change may reset the tags, which belong to a language.
   */
  updateLanguage(lang?: string): void {
    if (!lang || lang === this.selectedLang()) {
      return;
    }
    this.selectedLang.set(lang);
  }

  updateLicense(license?: string): void {
    this.selectedLicense.set(license);
  }

  /** Keeps the form in line with the selected licence. */
  private applyLicense(license?: string): void {
    this.formGroup.get('licenses')?.setValue(license);
    const attribution = this.formGroup.get('attribution');
    if (this.isAttributionOptional()) {
      attribution?.clearValidators();
    } else {
      attribution?.addValidators(Validators.required);
    }
    attribution?.updateValueAndValidity();
    this.lockLicense();
  }

  updateTags(tags: TemplateTagFragment[]): void {
    this.selectedTags.set(tags);
  }

  checkInput(control: string) {
    if (this.formGroup.get(control)?.invalid) {
      const invalidInput = this.inputs().find(
        (i) => i.id === control + 'Input'
      );
      if (invalidInput) {
        invalidInput.focus();
        return control;
      }
    }
  }

  getTemplate(): TemplateFormValue | undefined {
    let invalidInputName: string | undefined;
    for (const control in this.formGroup.controls) {
      if (!invalidInputName) {
        invalidInputName = this.checkInput(control);
      }
    }
    if (
      this.published() &&
      this.selectedTags().length === 0 &&
      !invalidInputName
    ) {
      this.templateTagSelection()?.tagInput()?.nativeElement.focus();
      invalidInputName = 'tags';
    }
    if (invalidInputName) {
      const msg = this.translateService.translate(
        'templates.please-fill-' + invalidInputName
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    return this.prepareTemplate();
  }

  prepareTemplate(): TemplateFormValue {
    const form = this.formGroup.getRawValue();
    return {
      aiGenerated: this.aiGenerated(),
      attribution: form.attribution ?? '',
      description: form.description ?? '',
      language: this.selectedLang(),
      licenseId: this.getLicenseIdToSend(),
      name: form.name ?? '',
      published: this.published(),
      tagNames: this.selectedTags().map((t) => t.name),
    };
  }

  /** An inherited licence is required even for an unpublished template. */
  private getLicenseIdToSend(): string | undefined {
    const inherited = this.getInheritedLicense();
    if (inherited) {
      return inherited.id;
    }
    return this.published() && !this.template()?.license
      ? this.selectedLicense()
      : undefined;
  }
}
