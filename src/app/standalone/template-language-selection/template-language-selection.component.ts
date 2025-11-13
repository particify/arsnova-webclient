import { Component, effect, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import { IsoLanguage } from '@app/core/models/iso-language';
import { LanguageService } from '@app/core/services/util/language.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';

@Component({
  selector: 'app-template-language-selection',
  imports: [CoreModule],
  templateUrl: './template-language-selection.component.html',
})
export class TemplateLanguageSelectionComponent extends FormComponent {
  private readonly translateService = inject(TranslocoService);
  private readonly langService = inject(LanguageService);

  readonly smaller = input(false);
  readonly defaultLang = input<string>();
  readonly allowNoneSelection = input(false);
  readonly selectedLang = model<IsoLanguage>();
  readonly langs = toSignal(
    this.langService
      .getIsoLanguages()
      .pipe(
        map((l) =>
          l.toSorted((a, b) => a.nativeName.localeCompare(b.nativeName))
        )
      ),
    { initialValue: [] }
  );

  constructor() {
    super();
    effect(() =>
      this.selectedLang.set(
        this.langs().find(
          (l) =>
            l.code ===
            (this.defaultLang() ||
              (this.allowNoneSelection()
                ? undefined
                : this.translateService.getActiveLang()))
        )
      )
    );
  }

  updateLang(lang?: IsoLanguage): void {
    this.selectedLang.set(lang);
  }
}
