import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAndWebinarIndexComponent } from './event-and-webinar-index.component';

describe('EventAndWebinarIndexComponent', () => {
  let component: EventAndWebinarIndexComponent;
  let fixture: ComponentFixture<EventAndWebinarIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAndWebinarIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAndWebinarIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
