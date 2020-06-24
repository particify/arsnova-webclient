import { ComponentFactoryResolver, Inject, Injectable, Optional, ViewContainerRef } from '@angular/core';
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

  createExtension(id: string, ref: ViewContainerRef): any {
    const extension = this.getExtension(id);
    if (!extension) {
      console.log(`No extension found for "${id}".`);
      return;
    }
    ref.clear();
    const factory = this.resolver.resolveComponentFactory(extension.getType());
    const componentRef = ref.createComponent(factory);

    return componentRef;
  }
}
