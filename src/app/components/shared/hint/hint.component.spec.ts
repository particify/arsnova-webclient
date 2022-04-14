import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HintComponent } from './hint.component';

describe('HintComponent', () => {
  let component: HintComponent;
  let fixture: ComponentFixture<HintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HintComponent ],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
