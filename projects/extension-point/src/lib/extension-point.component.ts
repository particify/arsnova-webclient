import {
  Component,
  ComponentRef,
  EventEmitter,
  OnInit,
  ViewContainerRef,
  Input,
  Output,
} from '@angular/core';
import { ExtensionFactory } from './extension-factory';

@Component({
  selector: 'lib-extension-point',
  templateUrl: './extension-point.component.html',
  styles: [':host:empty { display: none; }'],
  standalone: false,
})
export class ExtensionPointComponent implements OnInit {
  @Input({ required: true }) extensionId!: string;
  @Input() extensionData?: object;
  @Output() extensionEvent = new EventEmitter();
  componentRef?: ComponentRef<any> | null;
  extensionUnavailable = false;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private factory: ExtensionFactory
  ) {}

  ngOnInit() {
    this.componentRef = this.factory.createExtension(
      this.extensionId,
      this.extensionEvent,
      this.viewContainerRef,
      this.extensionData
    );
    this.extensionUnavailable = !this.componentRef;
  }
}
