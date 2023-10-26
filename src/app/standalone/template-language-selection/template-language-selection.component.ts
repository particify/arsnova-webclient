import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { FormService } from '@app/core/services/util/form.service';
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
  @Input() selectedLang?: string;
  langs: string[];

  constructor(
    protected formService: FormService,
    private translateService: TranslocoService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    if (!this.selectedLang) {
      this.selectedLang = this.translateService.getActiveLang();
    }
    this.langs = this.translateService
      .getAvailableLangs()
      .map((lang) => lang.toString());
  }

  updateLang(lang: string): void {
    this.selectedLang = lang;
    this.selectedLangChanged.emit(this.selectedLang);
  }
}
