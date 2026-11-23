import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataIndexAdminComponent } from './data-index-admin.component';

describe('DataIndexAdminComponent', () => {
  let component: DataIndexAdminComponent;
  let fixture: ComponentFixture<DataIndexAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataIndexAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataIndexAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
