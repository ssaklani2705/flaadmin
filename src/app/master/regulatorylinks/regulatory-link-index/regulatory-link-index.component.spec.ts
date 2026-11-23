import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulatoryLinkIndexComponent } from './regulatory-link-index.component';

describe('RegulatoryLinkIndexComponent', () => {
  let component: RegulatoryLinkIndexComponent;
  let fixture: ComponentFixture<RegulatoryLinkIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegulatoryLinkIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegulatoryLinkIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
