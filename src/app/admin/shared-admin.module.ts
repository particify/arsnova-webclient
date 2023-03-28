import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { CoreModule } from '@core/core.module';
import { EntityPropertiesComponent } from './entity-properties/entity-properties.component';

@NgModule({
  imports: [CommonModule, CoreModule, MatTreeModule],
  declarations: [EntityPropertiesComponent],
  exports: [EntityPropertiesComponent],
})
export class SharedAdminModule {}
