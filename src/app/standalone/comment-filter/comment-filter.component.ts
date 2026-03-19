import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Input,
  Output,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';
import { QnasByRoomIdGql, Tag } from '@gql/generated/graphql';
import { catchError, filter, of, switchMap } from 'rxjs';

@Component({
  imports: [CoreModule],
  selector: 'app-comment-filter',
  templateUrl: './comment-filter.component.html',
  styleUrls: ['./comment-filter.component.scss'],
})
export class CommentFilterComponent {
  protected qnasByRoomId = inject(QnasByRoomIdGql);

  roomId = input.required<string>();

  qnaResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.qnasByRoomId.watch({
          variables: {
            roomId,
          },
        }).valueChanges;
      }),
      filter((r) => r.dataState === 'complete'),
      catchError(() => of())
    )
  );

  protected qnaData = computed(() => {
    const qna = this.qnaResult()?.data.qnasByRoomId;
    if (qna?.edges && qna.edges[0]) {
      return qna.edges[0]?.node;
    }
  });

  tags = computed(() => this.qnaData()?.tags ?? []);

  @Input() selectedFlags: CommentFilter[] = [];
  @Input() period?: number;
  @Input() selectedTags?: Tag[];
  @Input() useIconButton = true;
  @Input() useExtraPadding = true;

  @Output() flagSelected = new EventEmitter<CommentFilter>();
  @Output() flagRemoved = new EventEmitter<CommentFilter>();
  @Output() periodSelected = new EventEmitter<number | undefined>();
  @Output() tagSelected = new EventEmitter<Tag>();
  CommentFilter = CommentFilter;
  periods = Object.values(CommentPeriod);

  filter(type: CommentFilter): void {
    if (this.selectedFlags.includes(type)) {
      this.flagRemoved.emit(type);
    } else {
      this.flagSelected.emit(type);
    }
  }

  emitTimeRange(range: CommentPeriod) {
    this.periodSelected.emit(this.getPostPeriodFromString(range));
  }

  isPeriodSelected(period: CommentPeriod) {
    return this.getPostPeriodFromString(period) === this.period;
  }

  getPostPeriodFromString(period: CommentPeriod) {
    switch (period) {
      case CommentPeriod.ONEHOUR:
        return 1;
      case CommentPeriod.THREEHOURS:
        return 3;
      case CommentPeriod.ONEDAY:
        return 24;
      case CommentPeriod.ONEWEEK:
        return 168;
      default:
        return undefined;
    }
  }

  getPeriodString(period?: number) {
    switch (period) {
      case 1:
        return CommentPeriod.ONEHOUR;
      case 3:
        return CommentPeriod.THREEHOURS;
      case 24:
        return CommentPeriod.ONEDAY;
      case 168:
        return CommentPeriod.ONEWEEK;
      default:
        return CommentPeriod.ALL;
    }
  }

  selectTag(tag: Tag): void {
    this.tagSelected.emit(tag);
  }

  isSelected(tagId: string) {
    return this.selectedTags && this.selectedTags.some((t) => t.id === tagId);
  }
}
