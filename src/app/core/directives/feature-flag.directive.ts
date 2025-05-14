import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

@Directive({
  selector: '[appFeatureFlag]',
  standalone: false,
})
export class FeatureFlagDirective implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  private templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  @Input({ required: true }) appFeatureFlag!: string;

  ngOnInit() {
    if (this.featureFlagService.isEnabled(this.appFeatureFlag)) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}
