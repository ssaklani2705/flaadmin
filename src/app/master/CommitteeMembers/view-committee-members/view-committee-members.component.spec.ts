import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCommitteeMembersComponent } from './view-committee-members.component';

describe('ViewCommitteeMembersComponent', () => {
  let component: ViewCommitteeMembersComponent;
  let fixture: ComponentFixture<ViewCommitteeMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCommitteeMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCommitteeMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
