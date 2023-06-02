import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  isEnabled(feature: string) {
    return environment.features.includes(feature);
  }
}
