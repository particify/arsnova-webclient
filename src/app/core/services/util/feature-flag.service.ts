import { Inject, Injectable } from '@angular/core';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ENVIRONMENT } from '@environments/environment-token';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  private enabledFeatures: string[];

  constructor(
    @Inject(ENVIRONMENT) private environment: any,
    apiConfigService: ApiConfigService
  ) {
    this.enabledFeatures = [...environment.features];
    apiConfigService.getApiConfig$().subscribe((config) => {
      if (config.ui.features) {
        this.mergeOverrides(config.ui.features);
      }
      if (!this.environment.production) {
        console.log('Enabled features:', this.enabledFeatures);
      }
    });
  }

  private mergeOverrides(features: Record<string, { enabled: boolean }>) {
    for (const feature in features) {
      const featureEnabled = features[feature].enabled;
      if (!featureEnabled && this.enabledFeatures.includes(feature)) {
        this.enabledFeatures.splice(this.enabledFeatures.indexOf(feature), 1);
      } else if (featureEnabled && !this.enabledFeatures.includes(feature)) {
        this.enabledFeatures.push(feature);
      }
    }
  }

  isEnabled(feature: string): boolean {
    return this.enabledFeatures.includes(feature);
  }
}
