import * as cscheid from '../cscheid.js';
import * as test from './test_all.js';

window.cscheid = cscheid;

// ////////////////////////////////////////////////////////////////////////////

export function testAll() {
  test.runTests();
}

// ////////////////////////////////////////////////////////////////////////////

testAll();
