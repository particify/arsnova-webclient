import { Directive, ElementRef, OnInit, inject } from '@angular/core';
import { FormService } from '@app/core/services/util/form.service';

@Directive({ selector: '[appDisableForm]' })
export class DisableFormDirective implements OnInit {
  private elementRef = inject(ElementRef);
  private formService = inject(FormService);

  ngOnInit(): void {
    this.formService.getFormDisabled().subscribe((disabled) => {
      this.elementRef.nativeElement.disabled = disabled;
    });
  }
}
