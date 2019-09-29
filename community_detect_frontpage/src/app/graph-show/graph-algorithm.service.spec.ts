import { TestBed } from '@angular/core/testing';

import { GraphAlgorithmService } from './process-graph.service';

describe('ProcessGraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GraphAlgorithmService = TestBed.get(GraphAlgorithmService);
    expect(service).toBeTruthy();
  });
});
