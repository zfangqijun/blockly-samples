/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';
import {runTestCases, TestCase} from './common_test_helpers.mocha';

/**
 * Field value test case.
 * @extends {TestCase}
 * @record
 */
export function FieldValueTestCase() {}
FieldValueTestCase.prototype = new TestCase();
/**
 * @type {*} The value to use in test.
 */
FieldValueTestCase.prototype.value = undefined;
/**
 * @type {*} The expected value.
 */
FieldValueTestCase.prototype.expectedValue = undefined;
/**
 * @type {string|undefined} Optional expected text (if not specified, default is
 *    String(expectedValue).
 */
FieldValueTestCase.prototype.expectedText = undefined;
/**
 * @type {!RegExp|string|undefined} Optional error message matcher if test case
 *    is expected to throw.
 */
FieldValueTestCase.prototype.errMsgMatcher = undefined;

/**
 * Field creation test case.
 * @extends {FieldValueTestCase}
 * @record
 */
export function FieldCreationTestCase() {}
FieldCreationTestCase.prototype = new FieldValueTestCase();
/**
 * @type {Array<*>} The arguments to pass to field constructor.
 */
FieldCreationTestCase.prototype.args = [];
/**
 * @type {string} The json to use in field creation.
 */
FieldCreationTestCase.prototype.json = undefined;

/**
 * Assert a field's value is the same as the expected value.
 * @param {!Blockly.Field} field The field.
 * @param {*} expectedValue The expected value.
 * @param {string=} expectedText The expected text.
 */
export function assertFieldValue(field, expectedValue,
    expectedText = undefined) {
  const actualValue = field.getValue();
  const actualText = field.getText();
  if (expectedText === undefined) {
    expectedText = String(expectedValue);
  }
  assert.equal(actualValue, expectedValue, 'Value');
  assert.equal(actualText, expectedText, 'Text');
}

/**
 * Runs provided creation test cases.
 * @param {!Array<!FieldCreationTestCase>} testCases The test cases to run.
 * @param {function(!Blockly.Field, !FieldCreationTestCase)} assertion The
 *    assertion to use.
 * @param {function(new:Blockly.Field,!FieldCreationTestCase):Blockly.Field
 *    } creation A function that returns an instance of the field based on the
 *    provided test case.
 * @private
 */
function runCreationTests_(testCases, assertion, creation) {
  /**
   * Creates test callback for creation test.
   * @param {FieldCreationTestCase} testCase The test case to use.
   * @return {Function} The test callback.
   */
  const createTestFn = (testCase) => {
    return function() {
      const field = creation.call(this, testCase);
      assertion(field, testCase);
    };
  };
  runTestCases(testCases, createTestFn);
}

/**
 * Runs provided creation test cases.
 * @param {!Array<!FieldCreationTestCase>} testCases The test cases to run.
 * @param {function(new:Blockly.Field,!FieldCreationTestCase):Blockly.Field
 *    } creation A function that returns an instance of the field based on the
 *    provided test case.
 * @private
 */
function runCreationTestsAssertThrows_(testCases, creation) {
  /**
   * Creates test callback for creation test.
   * @param {!FieldCreationTestCase} testCase The test case to use.
   * @return {!Function} The test callback.
   */
  const createTestFn = (testCase) => {
    return function() {
      assert.throws(function() {
        creation.call(this, testCase);
      }, testCase.errMsgMatcher);
    };
  };
  runTestCases(testCases, createTestFn);
}

/**
 * Runs suite of tests for constructor for the specified field.
 * @param {function(new:Blockly.Field, *=)} TestedField The class of the field
 *    being tested.
 * @param {Array<!FieldCreationTestCase>} validValueTestCases Test cases with
 *    valid values for given field.
 * @param {Array<!FieldCreationTestCase>} invalidValueTestCases Test cases with
 *    invalid values for given field.
 * @param {function(!Blockly.Field, !FieldCreationTestCase)
 *    } validRunAssertField Asserts that field has expected values.
 * @param {function(!Blockly.Field)=} assertFieldDefault Asserts that field has
 *    default values. If undefined, tests will check that field throws when
 *    invalid value is passed rather than asserting default.
 * @param {function(!FieldCreationTestCase=)=} customCreateWithJs Custom
 *    creation function to use in tests.
 */
export function runConstructorSuiteTests(TestedField, validValueTestCases,
    invalidValueTestCases, validRunAssertField, assertFieldDefault,
    customCreateWithJs) {
  suite('Constructor', function() {
    if (assertFieldDefault) {
      test('Empty', function() {
        const field = customCreateWithJs ? customCreateWithJs.call(this) :
            new TestedField();
        assertFieldDefault(field);
      });
    } else {
      test('Empty', function() {
        assert.throws(function() {
          customCreateWithJs ? customCreateWithJs.call(this) :
              new TestedField();
        });
      });
    }

    /**
     * Creates a field using its constructor and the provided test case.
     * @param {!FieldCreationTestCase} testCase The test case information.
     * @return {!Blockly.Field} The instantiated field.
     */
    const createWithJs = function(testCase) {
      return customCreateWithJs ? customCreateWithJs.call(this, testCase) :
          new TestedField(...testCase.args);
    };
    if (assertFieldDefault) {
      runCreationTests_(
          invalidValueTestCases, assertFieldDefault, createWithJs);
    } else {
      runCreationTestsAssertThrows_(invalidValueTestCases, createWithJs);
    }
    runCreationTests_(validValueTestCases, validRunAssertField, createWithJs);
  });
}

/**
 * Runs suite of tests for fromJson creation of specified field.
 * @param {function(new:Blockly.Field, *=)} TestedField The class of the field
 *    being tested.
 * @param {!Array<!FieldCreationTestCase>} validValueTestCases Test cases with
 *    valid values for given field.
 * @param {!Array<!FieldCreationTestCase>} invalidValueTestCases Test cases with
 *    invalid values for given field.
 * @param {function(!Blockly.Field, !FieldValueTestCase)
 *    } validRunAssertField Asserts that field has expected values.
 * @param {function(!Blockly.Field)=} assertFieldDefault Asserts that field has
 *    default values. If undefined, tests will check that field throws when
 *    invalid value is passed rather than asserting default.
 * @param {function(!FieldCreationTestCase=)=} customCreateWithJson Custom
 *    creation function to use in tests.
 */
export function runFromJsonSuiteTests(TestedField, validValueTestCases,
    invalidValueTestCases, validRunAssertField, assertFieldDefault,
    customCreateWithJson) {
  suite('fromJson', function() {
    if (assertFieldDefault) {
      test('Empty', function() {
        const field = customCreateWithJson ? customCreateWithJson.call(this) :
            TestedField.fromJson({});
        assertFieldDefault(field);
      });
    } else {
      test('Empty', function() {
        assert.throws(function() {
          customCreateWithJson ? customCreateWithJson.call(this) :
              TestedField.fromJson({});
        });
      });
    }

    /**
     * Creates a field using fromJson and the provided test case.
     * @param {!FieldCreationTestCase} testCase The test case information.
     * @return {!Blockly.Field} The instantiated field.
     */
    const createWithJson = function(testCase) {
      return customCreateWithJson ? customCreateWithJson.call(this, testCase) :
          TestedField.fromJson(testCase.json);
    };
    if (assertFieldDefault) {
      runCreationTests_(
          invalidValueTestCases, assertFieldDefault, createWithJson);
    } else {
      runCreationTestsAssertThrows_(invalidValueTestCases, createWithJson);
    }
    runCreationTests_(validValueTestCases, validRunAssertField, createWithJson);
  });
}

/**
 * Runs tests for setValue calls.
 * @param {!Array<!FieldValueTestCase>} validValueTestCases Test cases with
 *    valid values.
 * @param {!Array<!FieldValueTestCase>} invalidValueTestCases Test cases with
 *    invalid values.
 * @param {*} invalidRunExpectedValue Expected value for field after invalid
 *    call to setValue.
 * @param {string=} invalidRunExpectedText Expected text for field after invalid
 *    call to setValue.
 */
export function runSetValueTests(validValueTestCases, invalidValueTestCases,
    invalidRunExpectedValue, invalidRunExpectedText) {
  /**
   * Creates test callback for invalid setValue test.
   * @param {!FieldValueTestCase} testCase The test case information.
   * @return {!Function} The test callback.
   */
  const createInvalidSetValueTestCallback = (testCase) => {
    return function() {
      this.field.setValue(testCase.value);
      assertFieldValue(
          this.field, invalidRunExpectedValue, invalidRunExpectedText);
    };
  };
  /**
   * Creates test callback for valid setValue test.
   * @param {!FieldValueTestCase} testCase The test case information.
   * @return {!Function} The test callback.
   */
  const createValidSetValueTestCallback = (testCase) => {
    return function() {
      this.field.setValue(testCase.value);
      assertFieldValue(
          this.field, testCase.expectedValue, testCase.expectedText);
    };
  };
  runTestCases(invalidValueTestCases, createInvalidSetValueTestCallback);
  runTestCases(validValueTestCases, createValidSetValueTestCallback);
}
