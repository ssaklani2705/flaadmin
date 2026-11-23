import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataIndexComponent } from './data-index.component';

describe('DataIndexComponent', () => {
  let component: DataIndexComponent;
  let fixture: ComponentFixture<DataIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
