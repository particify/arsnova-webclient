import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { FormattingService } from '@arsnova/app/services/http/formatting.service';

import { RenderedTextComponent } from './rendered-text.component';

describe('RenderedTextComponent', () => {
  let component: RenderedTextComponent;
  let fixture: ComponentFixture<RenderedTextComponent>;

  const mockFormattingService = jasmine.createSpyObj(['postString']);

  const mockDomSanitizer = jasmine.createSpyObj(['bypassSecurityTrustHtml']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RenderedTextComponent ],
      providers: [
        {
          provide: FormattingService,
          useValue: mockFormattingService
        },
        {
          provide: DomSanitizer,
          useValue: mockDomSanitizer
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenderedTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
