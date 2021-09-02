import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MartingaleComponent } from './martingale.component';

describe('MartingaleComponent', () => {
  let component: MartingaleComponent;
  let fixture: ComponentFixture<MartingaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MartingaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MartingaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
