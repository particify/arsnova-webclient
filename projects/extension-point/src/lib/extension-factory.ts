import {
  ComponentFactoryResolver,
  Injectable,
  ViewContainerRef,
  ComponentRef,
  EventEmitter,
  inject,
  Inject,
  Optional,
} from '@angular/core';
import { environment } from '@environments/environment';
import { Extension } from './extension';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

@Injectable({
  providedIn: 'root',
})
export class ExtensionFactory {
  private resolver = inject(ComponentFactoryResolver);
  private featureFlagService = inject(FeatureFlagService);

  extensions: { [key: string]: Extension } = {};

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(@Inject(Extension) @Optional() extensions: Extension[]) {
    const featureFlagService = this.featureFlagService;

    if (extensions) {
      extensions = extensions.filter((e) =>
        featureFlagService.isEnabled('extension-' + e.getId())
      );
      extensions.forEach((e) => {
        if (!environment.production) {
          console.log(`Extension registered: ${e.getId()}`);
        }
        this.extensions[e.getId()] = e;
      });
    }
  }

  getExtension(id: string): Extension {
    return this.extensions[id];
  }

  createExtension(
    id: string,
    eventEmitter: EventEmitter<any>,
    ref: ViewContainerRef,
    data?: object
  ): ComponentRef<any> | null {
    const extension = this.getExtension(id);
    if (!extension) {
      if (!environment.production) {
        console.log(`No extension found for "${id}".`);
      }
      return null;
    }
    ref.clear();
    const factory = this.resolver.resolveComponentFactory(extension.getType());
    const componentRef = ref.createComponent(factory);
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    if (data) {
      for (const key of Object.keys(data)) {
        componentRef.instance[key] = data[key as keyof object];
      }
    }
    componentRef.instance.event = eventEmitter;

    return componentRef;
  }
}
