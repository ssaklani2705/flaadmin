import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeSharingIndexComponent } from './knowledge-sharing-index.component';

describe('KnowledgeSharingIndexComponent', () => {
  let component: KnowledgeSharingIndexComponent;
  let fixture: ComponentFixture<KnowledgeSharingIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeSharingIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeSharingIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
