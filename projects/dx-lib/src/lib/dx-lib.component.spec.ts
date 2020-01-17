import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DxLibComponent } from './dx-lib.component';

describe('DxLibComponent', () => {
  let component: DxLibComponent;
  let fixture: ComponentFixture<DxLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DxLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DxLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
