import {
  Directive,
  ElementRef,
  inject,
  Input,
  input,
  OnInit,
} from '@angular/core';
import { Room } from '@app/core/models/room';

/**
 * This directive automatically sets the lang attribute based on the room's language. Optionally,
 * the text direction will be determined automatically if the appDirContext attribute used.
 */
@Directive({ selector: '[appLangContext]', standalone: true })
export class LanguageContextDirective implements OnInit {
  // Route data input below
  @Input() room?: Room;

  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  public appDirContext = input();

  ngOnInit(): void {
    const lang = this.room?.language;
    const el = this.elementRef.nativeElement;
    if (lang) {
      el.setAttribute('lang', lang);
    }
    if (this.appDirContext() !== undefined) {
      el.setAttribute('dir', this.determineDirection(lang));
    }
  }

  determineDirection(language?: string) {
    if (!language) {
      return 'auto';
    }
    // Temporary workaround: use any until getTextInfo is standardized
    // See: https://tc39.es/proposal-intl-locale-info/#sec-Intl.Locale.prototype.getTextInfo
    const locale = new Intl.Locale(language) as any;
    const textInfo =
      (locale.getTextInfo && locale.getTextInfo()) ?? locale.textInfo;
    return textInfo?.direction ?? 'auto';
  }
}
