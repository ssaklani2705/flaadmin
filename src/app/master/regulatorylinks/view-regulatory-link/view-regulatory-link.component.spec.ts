import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRegulatoryLinkComponent } from './view-regulatory-link.component';

describe('ViewRegulatoryLinkComponent', () => {
  let component: ViewRegulatoryLinkComponent;
  let fixture: ComponentFixture<ViewRegulatoryLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRegulatoryLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRegulatoryLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
