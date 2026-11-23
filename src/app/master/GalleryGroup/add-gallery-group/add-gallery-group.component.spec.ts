import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGalleryGroupComponent } from './add-gallery-group.component';

describe('AddGalleryGroupComponent', () => {
  let component: AddGalleryGroupComponent;
  let fixture: ComponentFixture<AddGalleryGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGalleryGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGalleryGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
