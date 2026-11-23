import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryGroupIndexComponent } from './gallery-group-index.component';

describe('GalleryGroupIndexComponent', () => {
  let component: GalleryGroupIndexComponent;
  let fixture: ComponentFixture<GalleryGroupIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryGroupIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryGroupIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
