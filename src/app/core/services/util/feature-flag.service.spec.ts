import { inject } from '@angular/core/testing';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { ENVIRONMENT } from '@environments/environment-token';
import { configureTestModule } from '@testing/test.setup';
import { of } from 'rxjs';

describe('FeatureFlagService', () => {
  describe('without feature overrides from ApiConfig', () => {
    const environment = {
      features: ['testEnvFeature1', 'testEnvFeature2', 'testEnvFeature3'],
      production: true,
    };
    const apiConfigSpy = jasmine.createSpyObj(ApiConfigService, [
      'getApiConfig$',
    ]);
    apiConfigSpy.getApiConfig$.and.returnValue(
      of({
        ui: {},
      })
    );

    beforeEach(() => {
      configureTestModule(
        [],
        [
          FeatureFlagService,
          {
            provide: ENVIRONMENT,
            useValue: environment,
          },
          {
            provide: ApiConfigService,
            useValue: apiConfigSpy,
          },
        ]
      );
    });

    it('should be created', inject(
      [FeatureFlagService],
      (service: FeatureFlagService) => {
        expect(service).toBeTruthy();
      }
    ));

    it('should use environment config to determine enabled features', inject(
      [FeatureFlagService],
      (service: FeatureFlagService) => {
        console.log('environment', environment);
        for (const feature of environment.features) {
          expect(service.isEnabled(feature)).toBe(
            true,
            `${feature} should be enabled.`
          );
        }
      }
    ));
  });

  describe('with feature overrides from ApiConfig', () => {
    const environment = {
      features: [
        'testEnvFeature',
        'testEnvFeatureApiTrue',
        'testEnvFeatureApiFalse',
      ],
      production: true,
    };
    const apiConfigSpy = jasmine.createSpyObj(ApiConfigService, [
      'getApiConfig$',
    ]);
    const apiFeatureOverrides = {
      testApiFeatureTrue: { enabled: true },
      testApiFeatureFalse: { enabled: false },
      testEnvFeatureApiTrue: { enabled: true },
      testEnvFeatureApiFalse: { enabled: false },
    };
    apiConfigSpy.getApiConfig$.and.returnValue(
      of({
        ui: {
          features: apiFeatureOverrides,
        },
      })
    );

    beforeEach(() => {
      configureTestModule(
        [],
        [
          FeatureFlagService,
          {
            provide: ENVIRONMENT,
            useValue: environment,
          },
          {
            provide: ApiConfigService,
            useValue: apiConfigSpy,
          },
        ]
      );
    });

    it('should be created', inject(
      [FeatureFlagService],
      (service: FeatureFlagService) => {
        expect(service).toBeTruthy();
      }
    ));

    it('should use API config to override enabled features', inject(
      [FeatureFlagService],
      (service: FeatureFlagService) => {
        expect(service.isEnabled('testEnvFeature')).toBeTrue();
        expect(service.isEnabled('testEnvFeatureApiTrue')).toBeTrue();
        expect(service.isEnabled('testEnvFeatureApiFalse')).toBeFalse();
        expect(service.isEnabled('testApiFeatureTrue')).toBeTrue();
        expect(service.isEnabled('testApiFeatureFalse')).toBeFalse();
      }
    ));
  });
});
