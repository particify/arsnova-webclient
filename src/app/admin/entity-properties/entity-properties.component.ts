import { Component, Input, OnChanges, inject } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-entity-properties',
  templateUrl: './entity-properties.component.html',
  styleUrls: ['./entity-properties.component.scss'],
  standalone: false,
})
export class EntityPropertiesComponent implements OnChanges {
  private translateService = inject(TranslocoService);

  @Input({ required: true }) entity!: object;
  @Input() translateKeys = false;
  @Input() expandOnInit = false;
  treeControl: NestedTreeControl<any> = new NestedTreeControl(
    (obj) => obj.value
  );
  dataSource = new MatTreeNestedDataSource<object>();

  ngOnChanges() {
    this.dataSource.data = this.toNode(this.entity);
    if (this.expandOnInit) {
      this.treeControl.dataNodes = this.dataSource.data;
      this.treeControl.expandAll();
    }
  }

  toNode(object: object): object[] {
    if (typeof object === 'object') {
      return object
        ? Object.entries(object).map((item) => {
            return { key: item[0], value: this.toNode(item[1]) };
          })
        : [];
    }

    return object;
  }

  hasChild(number: number, node: any) {
    return node.value && typeof node.value === 'object';
  }

  isSimpleValue(value: any) {
    return typeof value !== 'object';
  }

  getItemText(key: string): string {
    if (this.translateKeys) {
      const translateKey = 'admin.admin-area.' + key;
      const translatedKey = this.translateService.translate(translateKey);
      return translatedKey !== translateKey ? translatedKey : key;
    }
    return key;
  }
}
