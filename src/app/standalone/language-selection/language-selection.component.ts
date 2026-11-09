import {
  Component,
  effect,
  inject,
  input,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import { FormComponent } from '@app/standalone/form/form.component';
import { LanguageFragment, LanguagesGql } from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';

@Component({
  selector: 'app-language-selection',
  imports: [CoreModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './language-selection.component.html',
})
export class LanguageSelectionComponent extends FormComponent {
  private readonly translateService = inject(TranslocoService);
  private readonly languagesGql = inject(LanguagesGql);

  readonly smaller = input(false);
  readonly defaultLang = input<string>();
  readonly allowNoneSelection = input(false);
  readonly selectedLang = model<LanguageFragment>();
  readonly langs = toSignal(
    this.languagesGql
      .fetch()
      .pipe(
        map((r) =>
          (r.data?.languages ?? []).toSorted((a, b) =>
            a.nativeName.localeCompare(b.nativeName)
          )
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

  updateLang(lang?: LanguageFragment): void {
    this.selectedLang.set(lang);
  }
}
