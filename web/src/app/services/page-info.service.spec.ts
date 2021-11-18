import { TestBed } from '@angular/core/testing';

import { PageInfoService } from './page-info.service';

describe('PageInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PageInfoService = TestBed.get(PageInfoService);
    expect(service).toBeTruthy();
  });
});
