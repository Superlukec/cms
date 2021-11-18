import { TestBed } from '@angular/core/testing';

import { UnderConstructionService } from './under-construction.service';

describe('UnderConstructionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnderConstructionService = TestBed.get(UnderConstructionService);
    expect(service).toBeTruthy();
  });
});
