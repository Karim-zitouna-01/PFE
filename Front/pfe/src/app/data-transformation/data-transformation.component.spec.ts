import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTransformationComponent } from './data-transformation.component';

describe('DataTransformationComponent', () => {
  let component: DataTransformationComponent;
  let fixture: ComponentFixture<DataTransformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataTransformationComponent]
    });
    fixture = TestBed.createComponent(DataTransformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
