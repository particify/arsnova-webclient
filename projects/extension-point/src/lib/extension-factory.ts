import {
  ComponentFactoryResolver,
  Inject,
  Injectable,
  Optional,
  ViewContainerRef,
  ComponentRef,
  EventEmitter,
} from '@angular/core';
import { environment } from '../../../../src/environments/environment';
import { Extension } from './extension';

@Injectable({
  providedIn: 'root',
})
export class ExtensionFactory {
  extensions: { [key: string]: Extension } = {};

  constructor(
    @Inject(Extension) @Optional() extensions: Extension[],
    private resolver: ComponentFactoryResolver
  ) {
    if (extensions) {
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
    data: object,
    eventEmitter: EventEmitter<any>,
    ref: ViewContainerRef
  ): ComponentRef<any> | null {
    const extension = this.getExtension(id);
    if (!extension) {
      if (!environment.production) {
        console.log(`No extension found for "${id}".`);
      }
      return;
    }
    ref.clear();
    const factory = this.resolver.resolveComponentFactory(extension.getType());
    const componentRef = ref.createComponent(factory);
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    if (data) {
      for (const key of Object.keys(data)) {
        componentRef.instance[key] = data[key];
      }
    }
    componentRef.instance.event = eventEmitter;

    return componentRef;
  }
}
