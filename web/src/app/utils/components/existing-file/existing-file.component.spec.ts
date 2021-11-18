import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingFileComponent } from './existing-file.component';

describe('ExistingFileComponent', () => {
  let component: ExistingFileComponent;
  let fixture: ComponentFixture<ExistingFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
