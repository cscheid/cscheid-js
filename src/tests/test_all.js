import * as testApproximation from './test_approximation.js';
import * as testArray from './test_array.js';
import * as testGeometry from './test_geometry.js';
import * as testKrylov from './test_krylov.js';
import * as testLinalg from './test_linalg.js';
import * as testMath from './test_math.js';
import * as testObject from './test_object.js';

import {testModules} from './utils.js';

export function runTests() {
  testModules([
    testApproximation,
    testArray,
    testGeometry,
    testKrylov,
    testLinalg,
    testMath,
    testObject,
  ]);
}
