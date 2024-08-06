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
  @Input()
  set room(room: Room) {
    this.language = room?.language;
  }
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private language?: string;
  public appDirContext = input();

  ngOnInit(): void {
    const el = this.elementRef.nativeElement;
    if (this.language) {
      el.setAttribute('lang', this.language);
    }
    if (this.appDirContext() !== undefined) {
      el.setAttribute('dir', this.determineDirection(this.language));
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
