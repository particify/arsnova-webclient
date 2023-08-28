import { Directive, ElementRef, OnInit } from '@angular/core';
import { FormService } from '@app/core/services/util/form.service';

@Directive({
  selector: '[appDisableForm]',
})
export class DisableFormDirective implements OnInit {
  constructor(
    private elementRef: ElementRef,
    private formService: FormService
  ) {}

  ngOnInit(): void {
    this.formService.getFormDisabled().subscribe((disabled) => {
      this.elementRef.nativeElement.disabled = disabled;
    });
  }
}
