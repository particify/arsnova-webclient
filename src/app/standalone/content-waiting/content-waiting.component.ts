import {
  Component,
  Input,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  RoomUserAlias,
  RoomUserAliasByRoomIdDocument,
  RoomUserAliasByRoomIdGql,
  SetRoomUserAliasGql,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-content-waiting',
  imports: [CoreModule, ContentStepInfoComponent, LoadingButtonComponent],
  templateUrl: './content-waiting.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-waiting.component.scss',
})
export class ContentWaitingComponent extends FormComponent {
  private roomUserAliasByRoomId = inject(RoomUserAliasByRoomIdGql);
  private setRoomUserAlias = inject(SetRoomUserAliasGql);
  private readonly mutations = mutationHelper();

  @Input() current?: number;
  @Input() totalCount?: number;
  @Input({ required: true }) roomId!: string;
  @Input() alias?: RoomUserAlias;
  @Input() isLocked = false;
  @Input() timerActive = false;
  @Input() aliasRequired = false;

  enteredAlias = '';

  /**
   * Persists the alias for the room, either by accepting the proposal's `seed`
   * or with a custom one. This can only be done once per room. A blank custom
   * alias counts as none, so the proposal is accepted instead.
   */
  setAlias(): void {
    const roomId = this.roomId;
    const alias = this.enteredAlias.trim();
    const seed = this.alias?.seed;
    if (!alias && seed == null) {
      return;
    }
    this.disableForm();
    const changes = alias ? { alias } : { seed };
    this.setRoomUserAlias
      .mutate({
        variables: { roomId, ...changes },
        // A proposal carries no id, so Apollo cannot normalize the result into
        // the query it was read from.
        update: (cache, { data }) => {
          const alias = data?.setRoomUserAlias;
          if (alias) {
            cache.writeQuery({
              query: RoomUserAliasByRoomIdDocument,
              variables: { roomId },
              data: { roomUserAliasByRoomId: alias },
            });
          }
        },
      })
      .pipe(this.mutations.reportErrors())
      .subscribe({ error: () => this.enableForm() });
  }

  /** Requests another proposal for an alias which is not persisted yet. */
  generateAlias(): void {
    this.roomUserAliasByRoomId
      .fetch({
        variables: { roomId: this.roomId },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((r) => r.data?.roomUserAliasByRoomId),
        filter((alias) => !!alias)
      )
      .subscribe((alias) => {
        this.alias = alias;
      });
  }
}
