import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGalleryGroupComponent } from './view-gallery-group.component';

describe('ViewGalleryGroupComponent', () => {
  let component: ViewGalleryGroupComponent;
  let fixture: ComponentFixture<ViewGalleryGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGalleryGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGalleryGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
