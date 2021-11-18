import { TestBed } from '@angular/core/testing';

import { CkeditorLoaderService } from './ckeditor-loader.service';

describe('CkeditorLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CkeditorLoaderService = TestBed.get(CkeditorLoaderService);
    expect(service).toBeTruthy();
  });
});
