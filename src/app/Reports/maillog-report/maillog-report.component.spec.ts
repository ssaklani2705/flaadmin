import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaillogReportComponent } from './maillog-report.component';

describe('MaillogReportComponent', () => {
  let component: MaillogReportComponent;
  let fixture: ComponentFixture<MaillogReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaillogReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaillogReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
