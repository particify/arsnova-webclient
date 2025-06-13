import { Injectable } from '@angular/core';
import { SurveyStarted } from '@app/core/models/events/survey-started';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { RoomSettings } from '@app/core/models/room-settings';

@Injectable({ providedIn: 'root' })
export class RoomSettingsService extends AbstractEntityService<RoomSettings> {
  private roomSettingsMapping = new Map<string, string>();

  constructor() {
    super('RoomSettings', '/roomsettings');
  }

  /** Fetches RoomSettings by roomId. It stores the mapping to the RoomSettings'
   * own ID, which is used for subsequent calls to enable caching. */
  getByRoomId(roomId: string): Observable<RoomSettings> {
    const id = this.roomSettingsMapping.get(roomId);
    if (id) {
      return this.getById(id, { roomId: roomId });
    }
    const uri = this.buildUri('/', roomId);
    const roomSettings = this.fetchOnce(uri);
    return roomSettings.pipe(
      tap((rs) => {
        this.roomSettingsMapping.set(roomId, rs.id);
        this.handleEntityCaching(rs.id, rs);
      })
    );
  }

  /** Patches RoomSettings by roomId. It uses the local mapping to the
   * RoomSettings' own ID if it already exists. Otherwise, the settings are
   * fetched to obtain the ID. */
  patchEntityByRoomId(
    roomId: string,
    changes: Partial<RoomSettings>
  ): Observable<RoomSettings> {
    const id = this.roomSettingsMapping.get(roomId);
    if (id) {
      return super.patchEntity(id, changes, roomId);
    }
    return this.getByRoomId(roomId).pipe(
      switchMap((rs) => super.patchEntity(rs.id, changes, roomId))
    );
  }

  getRoomSettingsStream(
    roomId: string,
    roomSettingsId: string
  ): Observable<RoomSettings> {
    return this.wsConnector
      .getWatcher(
        `/topic/${roomId}.roomsettings-${roomSettingsId}.changes.stream`
      )
      .pipe(map((msg) => JSON.parse(msg.body)));
  }

  updateSurveyEnabled(
    roomId: string,
    surveyEnabled: boolean
  ): Observable<RoomSettings> {
    const changes: { surveyEnabled: boolean } = {
      surveyEnabled: surveyEnabled,
    };
    return this.patchEntityByRoomId(roomId, changes).pipe(
      map((updatedRoom) => {
        if (surveyEnabled) {
          const event = new SurveyStarted();
          this.eventService.broadcast(event.type);
        }
        const state = surveyEnabled ? 'started' : 'stopped';
        const msg = this.translateService.translate('creator.survey.' + state);
        this.notificationService.showAdvanced(
          msg,
          surveyEnabled
            ? AdvancedSnackBarTypes.SUCCESS
            : AdvancedSnackBarTypes.WARNING
        );
        return updatedRoom;
      })
    );
  }

  updateFeedbackType(
    roomId: string,
    feedbackType: LiveFeedbackType
  ): Observable<RoomSettings> {
    const changes: { surveyType: LiveFeedbackType } = {
      surveyType:
        feedbackType === LiveFeedbackType.FEEDBACK
          ? LiveFeedbackType.SURVEY
          : LiveFeedbackType.FEEDBACK,
    };
    return this.patchEntityByRoomId(roomId, changes);
  }

  updateFocusModeEnabled(
    roomId: string,
    focusModeEnabled: boolean
  ): Observable<RoomSettings> {
    const changes: { focusModeEnabled: boolean } = {
      focusModeEnabled: focusModeEnabled,
    };
    return this.patchEntityByRoomId(roomId, changes);
  }

  updateCommentThresholdEnabled(
    roomId: string,
    commentThresholdEnabled: boolean
  ) {
    const changes: { commentThresholdEnabled: boolean } = {
      commentThresholdEnabled: commentThresholdEnabled,
    };
    return this.patchEntityByRoomId(roomId, changes);
  }

  updateCommentThreshold(roomId: string, commentThreshold: number) {
    const changes: { commentThreshold: number } = {
      commentThreshold: commentThreshold,
    };
    return this.patchEntityByRoomId(roomId, changes);
  }

  updateCommentTags(roomId: string, commentTags: string[]) {
    const changes: { commentTags: string[] } = {
      commentTags: commentTags,
    };
    return this.patchEntityByRoomId(roomId, changes);
  }
}
