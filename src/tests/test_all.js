import * as test_approximation from "./test_approximation.js";
import * as test_linalg from "./test_linalg.js";

export function runTests() {
  test_approximation.runTests();
  test_linalg.runTests();
}
