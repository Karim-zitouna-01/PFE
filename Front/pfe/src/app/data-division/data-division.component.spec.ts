import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDivisionComponent } from './data-division.component';

describe('DataDivisionComponent', () => {
  let component: DataDivisionComponent;
  let fixture: ComponentFixture<DataDivisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataDivisionComponent]
    });
    fixture = TestBed.createComponent(DataDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
