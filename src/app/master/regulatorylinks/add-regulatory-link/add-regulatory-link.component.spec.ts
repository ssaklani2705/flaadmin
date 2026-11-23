import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRegulatoryLinkComponent } from './add-regulatory-link.component';

describe('AddRegulatoryLinkComponent', () => {
  let component: AddRegulatoryLinkComponent;
  let fixture: ComponentFixture<AddRegulatoryLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRegulatoryLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRegulatoryLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
