import { ComponentFactoryResolver, Inject, Injectable, Optional, ViewContainerRef, ComponentRef, EventEmitter } from '@angular/core';
import { Extension } from './extension';

@Injectable()
export class ExtensionFactory {
  extensions: { [ key: string ]: Extension } = {};

  constructor(@Inject(Extension) @Optional() extensions: Extension[], private resolver: ComponentFactoryResolver) {
    if (extensions) {
      extensions.forEach(e => {
        console.log(`Extension registered: ${e.getId()}`);
        this.extensions[e.getId()] = e;
      });
    }
  }

  getExtension(id: string): Extension {
    return this.extensions[id];
  }

  createExtension(id: string, data: object, eventEmitter: EventEmitter<any>, ref: ViewContainerRef): ComponentRef<any> | null {
    const extension = this.getExtension(id);
    if (!extension) {
      console.log(`No extension found for "${id}".`);
      return;
    }
    ref.clear();
    const factory = this.resolver.resolveComponentFactory(extension.getType());
    const componentRef = ref.createComponent(factory);
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    for (const key of Object.keys(data)) {
      componentRef.instance[key] = data[key];
      componentRef.instance.event = eventEmitter;
    }

    return componentRef;
  }
}
