import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBankUserDialogComponent } from './add-bank-user-dialog.component';

describe('AddBankUserDialogComponent', () => {
  let component: AddBankUserDialogComponent;
  let fixture: ComponentFixture<AddBankUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBankUserDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBankUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
