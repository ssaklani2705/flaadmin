import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKnowledgeSharingComponent } from './add-knowledge-sharing.component';

describe('AddKnowledgeSharingComponent', () => {
  let component: AddKnowledgeSharingComponent;
  let fixture: ComponentFixture<AddKnowledgeSharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddKnowledgeSharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddKnowledgeSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
