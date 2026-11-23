import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewKnowledgeSharingComponent } from './view-knowledge-sharing.component';

describe('ViewKnowledgeSharingComponent', () => {
  let component: ViewKnowledgeSharingComponent;
  let fixture: ComponentFixture<ViewKnowledgeSharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewKnowledgeSharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewKnowledgeSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
