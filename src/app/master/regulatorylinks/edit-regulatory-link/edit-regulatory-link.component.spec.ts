import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRegulatoryLinkComponent } from './edit-regulatory-link.component';

describe('EditRegulatoryLinkComponent', () => {
  let component: EditRegulatoryLinkComponent;
  let fixture: ComponentFixture<EditRegulatoryLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRegulatoryLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRegulatoryLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
