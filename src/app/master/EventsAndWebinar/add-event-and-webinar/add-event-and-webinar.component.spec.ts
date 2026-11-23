import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEventAndWebinarComponent } from './add-event-and-webinar.component';

describe('AddEventAndWebinarComponent', () => {
  let component: AddEventAndWebinarComponent;
  let fixture: ComponentFixture<AddEventAndWebinarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEventAndWebinarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEventAndWebinarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
