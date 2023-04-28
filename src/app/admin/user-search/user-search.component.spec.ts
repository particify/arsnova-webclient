import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '@app/core/services/http/user.service';

import { UserSearchComponent } from './user-search.component';

describe('UserSearchComponent', () => {
  let component: UserSearchComponent;
  let fixture: ComponentFixture<UserSearchComponent>;

  const mockUserService = jasmine.createSpyObj('UserService', [
    'getUserByLoginId',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserSearchComponent],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
