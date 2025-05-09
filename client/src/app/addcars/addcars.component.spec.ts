import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcarsComponent } from './addcars.component';

describe('AddcarsComponent', () => {
  let component: AddcarsComponent;
  let fixture: ComponentFixture<AddcarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddcarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddcarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
