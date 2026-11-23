import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditKnowledgeSharingComponent } from './edit-knowledge-sharing.component';

describe('EditKnowledgeSharingComponent', () => {
  let component: EditKnowledgeSharingComponent;
  let fixture: ComponentFixture<EditKnowledgeSharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditKnowledgeSharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditKnowledgeSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
