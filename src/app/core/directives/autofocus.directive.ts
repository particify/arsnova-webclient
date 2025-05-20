import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective implements OnInit {
  private elementRef = inject(ElementRef);

  @Input() appAutofocus? = true;

  ngOnInit(): void {
    if (this.appAutofocus) {
      this.elementRef.nativeElement.focus();
    }
  }
}
