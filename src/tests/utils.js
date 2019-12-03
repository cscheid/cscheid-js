let indent = '';
/**
 * run all tests in the list of modules
 *
 * @param {Array} lst list of modules to run
 */
export function testModules(lst) {
  lst.forEach((mod) => {
    console.log(`${indent}Testing module ${mod.__name__}...`);
    indent = indent + '  ';
    try {
      mod.runTests();
    } finally {
      indent = indent.slice(0, -2);
    }
    console.log(`${indent}Tests for module ${mod.__name__} finished`);
  });
}
