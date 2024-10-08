import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { WordcloudComponent } from './wordcloud.component';
import { ThemeService } from '@app/core/theme/theme.service';

describe('WordcloudComponent', () => {
  let component: WordcloudComponent;
  let fixture: ComponentFixture<WordcloudComponent>;

  const themeService = jasmine.createSpyObj(ThemeService, ['getTextColors']);
  themeService.getTextColors.and.returnValue([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), WordcloudComponent],
      providers: [
        {
          provide: ThemeService,
          useValue: themeService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordcloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
