import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDivider } from '@angular/material/divider';
import {
  MatOption,
  MatSelect,
  MatSelectChange,
  MatSelectTrigger,
} from '@angular/material/select';
import { TranslocoPipe } from '@jsverse/transloco';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AssignableRolesService } from '@app/standalone/room-members/assignable-roles';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';
import { RoomMemberFragment, RoomRole } from '@gql/generated/graphql';
import { map } from 'rxjs';

const ROLE_SELECT_SELECTOR = '[data-testid="member-role-select"]';

let nextId = 0;

/** The last option of a member's role select, an action rather than a role. */
export const REMOVE_OPTION = 'remove';
type MemberOption = RoomRole | typeof REMOVE_OPTION;

/** Members of a room's team, with a select per member to change their role or remove them. */
@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    LoadingIndicatorComponent,
    MatDivider,
    MatOption,
    MatSelect,
    MatSelectTrigger,
    TranslocoPipe,
  ],
})
export class MemberListComponent {
  private readonly assignableRolesService = inject(AssignableRolesService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly roomMembersService = inject(RoomMembersService);

  readonly roomId = input.required<string>();
  /** Undefined while loading. */
  readonly members = input.required<
    readonly RoomMemberFragment[] | undefined
  >();
  /** Shows only the first members. */
  readonly limit = input<number>();
  /** Shows roles as text, without ways to change or remove them. */
  readonly readonly = input(false);
  /** Emits when a removal leaves no other member to move the focus to. */
  readonly lastRemoved = output<void>();

  readonly currentUserId = toSignal(
    inject(AuthenticationService)
      .getAuthenticatedUserChanges()
      .pipe(map((auth) => auth?.userId))
  );
  readonly shownMembers = computed(() =>
    this.members()?.slice(0, this.limit())
  );
  readonly labelId = 'team-members-label-' + nextId++;
  readonly Owner = RoomRole.Owner;
  readonly REMOVE = REMOVE_OPTION;

  roles(): RoomRole[] {
    return this.assignableRolesService.getRoles();
  }

  /** Removal leaves the select on the current role, so it never shows the action as a role. */
  select(member: RoomMemberFragment, change: MatSelectChange<MemberOption>) {
    if (change.value === REMOVE_OPTION) {
      change.source.value = member.role;
      this.remove(member);
    } else {
      this.roomMembersService.changeRole(this.roomId(), member, change.value);
    }
  }

  /**
   * Moves the focus to the next changeable member, the previous one, or reports there is none, as
   * it would otherwise be lost with the removed member.
   */
  remove(member: RoomMemberFragment) {
    const changeable = (this.shownMembers() ?? []).filter(
      (m) => m.role !== RoomRole.Owner
    );
    const index = changeable.indexOf(member);
    const target = changeable[index + 1] ?? changeable[index - 1];
    this.roomMembersService
      .remove(this.roomId(), member)
      .subscribe(() => this.focusRoleSelect(target));
  }

  private focusRoleSelect(member?: RoomMemberFragment) {
    const select = member
      ? this.elementRef.nativeElement.querySelector<HTMLElement>(
          `[data-member-id="${member.user.id}"] ${ROLE_SELECT_SELECTOR}`
        )
      : null;
    if (select) {
      select.focus();
    } else {
      this.lastRemoved.emit();
    }
  }

  initial(member: RoomMemberFragment): string {
    return (member.user.displayId ?? '').slice(0, 1).toLocaleUpperCase();
  }
}
