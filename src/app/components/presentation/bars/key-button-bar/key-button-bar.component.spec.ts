import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeyButtonBarComponent } from './key-button-bar.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { DOCUMENT } from '@angular/common';

describe('KeyButtonBarComponent', () => {
  let component: KeyButtonBarComponent;
  let fixture: ComponentFixture<KeyButtonBarComponent>;
  let document: Document;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyButtonBarComponent ],
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
    fixture = TestBed.createComponent(KeyButtonBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    document = TestBed.inject(DOCUMENT);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
