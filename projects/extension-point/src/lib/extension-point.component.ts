import { Component, OnInit, ViewContainerRef, Input } from '@angular/core';
import { ExtensionFactory } from './extension-factory';

@Component({
  selector: 'lib-extension-point',
  templateUrl: './extension-point.component.html'
})
export class ExtensionPointComponent implements OnInit {
  @Input() extensionId: string;
  extensionUnavailable = false;

  constructor(private viewContainerRef: ViewContainerRef, private factory: ExtensionFactory) {
  }

  ngOnInit() {
    this.extensionUnavailable = !this.factory.createExtension(this.extensionId, this.viewContainerRef);
  }
}
