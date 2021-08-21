import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { EssentialsModule } from '../essentials/essentials.module';
import { EntityPropertiesComponent } from './entity-properties/entity-properties.component';
import { UserSearchFieldComponent } from './user-search-field/user-search-field.component';

@NgModule({
  imports: [
    CommonModule,
    EssentialsModule,
    MatTreeModule
  ],
  declarations: [
    EntityPropertiesComponent,
    UserSearchFieldComponent
  ],
  exports: [
    EntityPropertiesComponent,
    UserSearchFieldComponent
  ]
})
export class SharedAdminModule {

}
