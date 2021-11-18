import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VShowFormComponent } from './v-show-form.component';

describe('VShowFormComponent', () => {
  let component: VShowFormComponent;
  let fixture: ComponentFixture<VShowFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VShowFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VShowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
