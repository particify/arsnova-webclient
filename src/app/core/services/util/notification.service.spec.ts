import { CombinedGraphQLErrors } from '@apollo/client';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ErrorClassification } from '@gql/helper/handle-operation-error';
import { TranslocoService } from '@jsverse/transloco';
import { configureTestModule } from '@testing/test.setup';

describe('NotificationService', () => {
  let service: NotificationService;
  const translateService = jasmine.createSpyObj('TranslocoService', {
    translate: 'mockedTranslate',
  });
  beforeEach(() => {
    const testBed = configureTestModule(
      [],
      [
        {
          provide: TranslocoService,
          useValue: translateService,
        },
      ]
    );
    service = testBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showOnRequestClientError', () => {
    const graphqlBadRequestResponse = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Bad Request',
          extensions: {
            classification: 'BAD_REQUEST',
          },
        },
      ],
      data: null,
    });

    it('should use the correct notification for request error', () => {
      const badRequestNoticication = {
        message: 'Bad Request',
        type: AdvancedSnackBarTypes.FAILED,
      };
      const notFoundNotification = {
        message: 'Not Found',
        type: AdvancedSnackBarTypes.FAILED,
      };
      spyOn(service, 'showAdvanced');
      service.showOnRequestClientError(graphqlBadRequestResponse, {
        [ErrorClassification.BadRequest]: badRequestNoticication,
        [ErrorClassification.NotFound]: notFoundNotification,
      });
      expect(service.showAdvanced).toHaveBeenCalledWith(
        badRequestNoticication.message,
        badRequestNoticication.type
      );
    });

    it('should use the fallback notification for request error', () => {
      const unexpectedNotification = {
        message: 'Unexpected',
        type: AdvancedSnackBarTypes.INFO,
      };
      spyOn(service, 'showAdvanced');
      service.showOnRequestClientError(graphqlBadRequestResponse, {
        [ErrorClassification.NotFound]: unexpectedNotification,
      });
      expect(service.showAdvanced).toHaveBeenCalledWith(
        'mockedTranslate',
        AdvancedSnackBarTypes.FAILED
      );
    });
  });
});
