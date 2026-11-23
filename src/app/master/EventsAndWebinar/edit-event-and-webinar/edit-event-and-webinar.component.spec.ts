import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEventAndWebinarComponent } from './edit-event-and-webinar.component';

describe('EditEventAndWebinarComponent', () => {
  let component: EditEventAndWebinarComponent;
  let fixture: ComponentFixture<EditEventAndWebinarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEventAndWebinarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEventAndWebinarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
