import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { IsoLanguage } from '@app/core/models/iso-language';
import { FormService } from '@app/core/services/util/form.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-template-language-selection',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './template-language-selection.component.html',
})
export class TemplateLanguageSelectionComponent
  extends FormComponent
  implements OnInit
{
  @Output() selectedLangChanged = new EventEmitter<string>();
  @Input() smaller = false;
  @Input() defaultLang?: string;
  selectedLang?: IsoLanguage;
  langs: IsoLanguage[];

  constructor(
    protected formService: FormService,
    private translateService: TranslocoService,
    private langService: LanguageService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    this.langService.getIsoLanguages().subscribe((langs) => {
      this.langs = langs;
      this.selectedLang = this.langs.find(
        (l) =>
          l.code === (this.defaultLang || this.translateService.getActiveLang())
      );
    });
  }

  updateLang(lang: IsoLanguage): void {
    this.selectedLang = lang;
    this.selectedLangChanged.emit(this.selectedLang?.code);
  }
}
