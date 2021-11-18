import { TestBed } from '@angular/core/testing';

import { LoadDataService } from './load-data.service';

describe('LoadDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadDataService = TestBed.get(LoadDataService);
    expect(service).toBeTruthy();
  });
});
