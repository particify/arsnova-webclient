import { NgModule } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { CoreModule } from '@app/core/core.module';
import { EntityPropertiesComponent } from './entity-properties/entity-properties.component';

@NgModule({
  imports: [CoreModule, MatTreeModule, EntityPropertiesComponent],
  exports: [EntityPropertiesComponent],
})
export class SharedAdminModule {}
