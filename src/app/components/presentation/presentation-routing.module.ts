import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { UserRole } from '../../models/user-roles.enum';
import { RoomResolver } from '../../resolver/room.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { PresentationComponent } from './presentation/presentation.component';

const routes: Routes = [
  {
    path: ':shortId',
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve: {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    },
    children: [
      {
        path: '',
        component: PresentationComponent
      },
      {
        path: 'comments',
        component: PresentationComponent,
        data: {
          feature: 'comments'
        }
      },
      {
        path: 'survey',
        component: PresentationComponent,
        data: {
          feature: 'survey'
        }
      },
      {
        path: ':contentGroup',
        component: PresentationComponent,
        data: {
          feature: 'group'
        }
      },
      {
        path: ':contentGroup/:contentIndex',
        component: PresentationComponent,
        data: {
          feature: 'group'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresentationRoutingModule { }
