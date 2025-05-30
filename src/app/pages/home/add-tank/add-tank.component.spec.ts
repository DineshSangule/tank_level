import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTankComponent } from './add-tank.component';

describe('AddTankComponent', () => {
  let component: AddTankComponent;
  let fixture: ComponentFixture<AddTankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
