import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTemplatePreviewComponent } from './content-group-template-preview.component';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { of } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';

describe('ContentGroupTemplatePreviewComponent', () => {
  let component: ContentGroupTemplatePreviewComponent;
  let fixture: ComponentFixture<ContentGroupTemplatePreviewComponent>;

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'getContentTemplates',
  ]);
  mockBaseTemplateService.getContentTemplates.and.returnValue(of([]));

  const mockContentService = jasmine.createSpyObj(ContentService, [
    'getTypeIcons',
  ]);
  mockContentService.getTypeIcons.and.returnValue(
    of(new Map<ContentType, string>())
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContentGroupTemplatePreviewComponent, getTranslocoModule()],
      providers: [
        {
          provide: BaseTemplateService,
          useValue: mockBaseTemplateService,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
    });
    fixture = TestBed.createComponent(ContentGroupTemplatePreviewComponent);
    component = fixture.componentInstance;
    component.template = new ContentGroupTemplate(
      'name',
      'description',
      'en',
      [],
      'cc0-1.0',
      []
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
