import { TestBed } from '@angular/core/testing';
import { CurrentUserWithSettingsGql } from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentResultsService } from './content-results.service';
import { VisualizationType } from './visualization/visualization-type';

describe('ContentResultsService', () => {
  function setUp(uiSettings?: { showContentResultsDirectly: boolean }) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CurrentUserWithSettingsGql,
          useValue: {
            fetch: () =>
              of({ data: { currentUser: uiSettings ? { uiSettings } : null } }),
          },
        },
      ],
    });
    return TestBed.inject(ContentResultsService);
  }

  it('shows the results directly if the user prefers it', () => {
    const service = setUp({ showContentResultsDirectly: true });

    expect(service.resultsVisible()).toBeTrue();
    expect(service.correctResultsVisible()).toBeTrue();
  });

  it('hides the results without a user preference', () => {
    const service = setUp();

    expect(service.resultsVisible()).toBeFalse();
    expect(service.correctResultsVisible()).toBeFalse();
  });

  it('lets the results and the correct answers be toggled independently', () => {
    const service = setUp({ showContentResultsDirectly: false });

    service.setResultsVisible(true);

    expect(service.resultsVisible()).toBeTrue();
    expect(service.correctResultsVisible()).toBeFalse();

    service.setCorrectResultsVisible(true);
    service.setResultsVisible(false);

    expect(service.resultsVisible()).toBeFalse();
    expect(service.correctResultsVisible()).toBeTrue();
  });

  it('starts with the wordcloud and remembers the chosen visualization', () => {
    const service = setUp();
    expect(service.activeWordcloudVisualization()).toBe(
      VisualizationType.WORDCLOUD
    );

    service.setActiveWordcloudVizualization(VisualizationType.TABLE);

    expect(service.activeWordcloudVisualization()).toBe(
      VisualizationType.TABLE
    );
  });
});
