import { Component, Input, OnChanges, inject } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  MatTreeNestedDataSource,
  MatTree,
  MatTreeNodeDef,
  MatTreeNode,
  MatTreeNodeToggle,
  MatNestedTreeNode,
  MatTreeNodeOutlet,
} from '@angular/material/tree';
import { TranslocoService } from '@jsverse/transloco';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-entity-properties',
  templateUrl: './entity-properties.component.html',
  styleUrls: ['./entity-properties.component.scss'],
  imports: [
    MatTree,
    MatTreeNodeDef,
    MatTreeNode,
    MatTreeNodeToggle,
    MatIconButton,
    MatNestedTreeNode,
    MatIcon,
    MatTreeNodeOutlet,
  ],
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
