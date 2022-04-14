import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatisticHelpComponent } from './statistic-help.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';

describe('StatisticHelpComponent', () => {
  let component: StatisticHelpComponent;
  let fixture: ComponentFixture<StatisticHelpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticHelpComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
