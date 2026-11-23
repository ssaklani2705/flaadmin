import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataIndexAdminViewComponent } from './data-index-admin-view.component';

describe('DataIndexAdminViewComponent', () => {
  let component: DataIndexAdminViewComponent;
  let fixture: ComponentFixture<DataIndexAdminViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataIndexAdminViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataIndexAdminViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
