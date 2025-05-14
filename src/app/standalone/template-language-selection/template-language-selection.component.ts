import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { IsoLanguage } from '@app/core/models/iso-language';
import { FormService } from '@app/core/services/util/form.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-template-language-selection',
  imports: [CoreModule],
  templateUrl: './template-language-selection.component.html',
})
export class TemplateLanguageSelectionComponent
  extends FormComponent
  implements OnInit
{
  protected formService: FormService;
  private translateService = inject(TranslocoService);
  private langService = inject(LanguageService);

  @Output() selectedLangChanged = new EventEmitter<string>();
  @Input() smaller = false;
  @Input() defaultLang?: string;
  @Input() allowNoneSelection = false;
  selectedLang?: IsoLanguage;
  langs: IsoLanguage[] = [];

  constructor() {
    const formService = inject(FormService);

    super(formService);

    this.formService = formService;
  }

  ngOnInit(): void {
    this.langService.getIsoLanguages().subscribe((langs) => {
      this.langs = langs.sort((a, b) =>
        a.nativeName.localeCompare(b.nativeName)
      );
      this.selectedLang = this.langs.find(
        (l) =>
          l.code ===
          (this.defaultLang ||
            (this.allowNoneSelection
              ? undefined
              : this.translateService.getActiveLang()))
      );
    });
  }

  updateLang(lang?: IsoLanguage): void {
    this.selectedLang = lang;
    this.selectedLangChanged.emit(this.selectedLang?.code);
  }
}
