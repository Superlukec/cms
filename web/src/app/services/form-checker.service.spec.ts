import { TestBed } from '@angular/core/testing';

import { FormCheckerService } from './form-checker.service';

describe('FormCheckerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormCheckerService = TestBed.get(FormCheckerService);
    expect(service).toBeTruthy();
  });
});
