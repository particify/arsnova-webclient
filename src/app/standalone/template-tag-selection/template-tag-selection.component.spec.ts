import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateTagSelectionComponent } from './template-tag-selection.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { MockAnnounceService } from '@testing/test-helpers';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';

describe('TemplateTagSelectionComponent', () => {
  let component: TemplateTagSelectionComponent;
  let fixture: ComponentFixture<TemplateTagSelectionComponent>;

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'getTemplateTags',
  ]);
  mockBaseTemplateService.getTemplateTags.and.returnValue(
    of([{ id: 'tagId', name: 'tagName' }])
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TemplateTagSelectionComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: BaseTemplateService,
          useValue: mockBaseTemplateService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
      ],
    });
    fixture = TestBed.createComponent(TemplateTagSelectionComponent);
    component = fixture.componentInstance;
    component.langChanged = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
