import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

@Directive({
  selector: '[appFeatureFlag]',
})
export class FeatureFlagDirective implements OnInit {
  @Input({ required: true }) appFeatureFlag!: string;

  constructor(
    private featureFlagService: FeatureFlagService,
    private templateRef: TemplateRef<unknown>,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    if (this.featureFlagService.isEnabled(this.appFeatureFlag)) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}
