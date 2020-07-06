import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-entity-properties',
  templateUrl: './entity-properties.component.html',
  styleUrls: ['./entity-properties.component.scss']
})
export class EntityPropertiesComponent {
  @Input() entity: object;

  constructor() {
  }

  isSimpleValue(value: any) {
    return typeof value !== 'object';
  }
}
