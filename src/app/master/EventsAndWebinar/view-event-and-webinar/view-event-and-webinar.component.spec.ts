import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEventAndWebinarComponent } from './view-event-and-webinar.component';

describe('ViewEventAndWebinarComponent', () => {
  let component: ViewEventAndWebinarComponent;
  let fixture: ComponentFixture<ViewEventAndWebinarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEventAndWebinarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEventAndWebinarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
