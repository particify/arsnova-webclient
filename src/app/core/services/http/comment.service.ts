import { inject, Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Room } from '@app/core/models/room';
import { Message } from '@stomp/stompjs';
import { Post } from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';

@Injectable()
export class CommentService {
  private translateService = inject(TranslocoService);

  getExportData(posts: Post[], delimiter: string): string {
    const exportPosts: Post[] = JSON.parse(JSON.stringify(posts));
    let valueFields = '';
    exportPosts.forEach((p) => {
      valueFields += this.filterNotSupportedCharacters(p.body) + delimiter;
      const time = p.createdAt;
      valueFields +=
        time.toString().slice(0, 10) +
        '-' +
        time.toString().slice(11, 16) +
        delimiter;
      const answer = p.replies && p.replies.length > 0 ? p.replies[0].body : '';
      valueFields +=
        (answer ? this.filterNotSupportedCharacters(answer) : '') + delimiter;
      valueFields += p.favorite + delimiter;
      valueFields += p.correct + delimiter;
      valueFields += p.score + delimiter;
      const tag = p.tags && p.tags.length > 0 ? p.tags[0].name : '';
      valueFields +=
        (tag ? this.filterNotSupportedCharacters(tag) : '') + '\r\n';
    });
    return valueFields;
  }

  filterNotSupportedCharacters(text: string): string {
    return (
      '"' +
      text
        .replace(/[\r\n]/g, ' ')
        .replace(/ +/g, ' ')
        .replace(/"/g, '""') +
      '"'
    );
  }

  export(posts: Post[], room: Room, name?: string): void {
    let csv: string;
    const fieldNames = [
      'comment-export.question',
      'comment-export.timestamp',
      'comment-export.answer',
      'comment-export.favorite',
      'comment-export.correct/wrong',
      'comment-export.score',
      'comment-export.tag',
    ];
    let keyFields;
    this.translateService
      .selectTranslate(fieldNames)
      .pipe(take(1))
      .subscribe((msgs) => {
        keyFields = [
          msgs[fieldNames[0]],
          msgs[fieldNames[1]],
          msgs[fieldNames[2]],
          msgs[fieldNames[3]],
          msgs[fieldNames[4]],
          msgs[fieldNames[5]],
          msgs[fieldNames[6]],
          '\r\n',
        ];
        const date = new Date();
        const dateString = date.toLocaleDateString();
        csv = keyFields + this.getExportData(posts, ',');
        const myBlob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        const fileName =
          room.name +
          '_' +
          room.shortId +
          '_' +
          (name ? name : dateString) +
          '.csv';
        link.setAttribute('download', fileName);
        link.href = window.URL.createObjectURL(myBlob);
        link.click();
      });
  }

  getUpdatedCommentCountWithMessage(count: number, message: Message): number {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    if (msg.type === 'CommentCreated') {
      count++;
    } else if (msg.type === 'CommentDeleted') {
      count--;
    } else if (msg.type === 'CommentPatched') {
      for (const [key, value] of Object.entries(payload.changes)) {
        switch (key) {
          case 'ack':
            if (!(<boolean>value)) {
              count--;
            }
            break;
        }
      }
    }
    return count;
  }
}
