import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingComponent } from './voting.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@testing/test-helpers';
import { VoteService } from '@app/core/services/http/vote.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CoreModule } from '@app/core/core.module';

describe('VotingComponent', () => {
  let component: VotingComponent;
  let fixture: ComponentFixture<VotingComponent>;

  const mockVoteService = jasmine.createSpyObj([
    'vote-up',
    'vote-down',
    'deleteVote',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VotingComponent,
        CoreModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        MatTooltipModule,
      ],
      providers: [
        {
          provide: VoteService,
          useValue: mockVoteService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
