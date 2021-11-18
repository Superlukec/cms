import { TestBed } from '@angular/core/testing';

import { ShareableService } from './shareable.service';

describe('ShareableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShareableService = TestBed.get(ShareableService);
    expect(service).toBeTruthy();
  });
});
