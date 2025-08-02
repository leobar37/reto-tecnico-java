import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsChart } from './claims-chart';

describe('ClaimsChart', () => {
  let component: ClaimsChart;
  let fixture: ComponentFixture<ClaimsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
