/*
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticSortComponent } from './statistic-sort.component';
import { Injectable } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ThemeService } from '@arsnova/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
class MockContentService {

}

@Injectable()
class MockContentAnswerService {

}


@Injectable()
class MockThemeService {

}

@Injectable()
class MockTranslateService {
  public get(key: string): Observable<String> {
    return of (key);
  }
}

describe('StatisticSortComponent', () => {
  let component: StatisticSortComponent;
  let fixture: ComponentFixture<StatisticSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticSortComponent ],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of([{ id: 1 }]),
            data: of()
          },
        },
        {
          provide: ThemeService,
          useClass: MockThemeService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

*/
