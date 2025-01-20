import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: false,
})
export class AutofocusDirective implements OnInit {
  @Input() appAutofocus? = true;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.appAutofocus) {
      this.elementRef.nativeElement.focus();
    }
  }
}
