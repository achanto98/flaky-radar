import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

export type TestStatus = 'passed' | 'failed' | 'skipped';

export interface TestResult {
  suite: string;
  testName: string;
  status: TestStatus;
  duration: number;
}

interface RawTestCase {
  '@_name'?: string;
  '@_classname'?: string;
  '@_time'?: string;
  failure?: unknown;
  error?: unknown;
  skipped?: unknown;
}

interface RawTestSuite {
  '@_name'?: string;
  testcase?: RawTestCase | RawTestCase[];
}

interface RawDocument {
  testsuites?: { testsuite?: RawTestSuite | RawTestSuite[] };
  testsuite?: RawTestSuite | RawTestSuite[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => name === 'testsuite' || name === 'testcase',
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function statusOf(testcase: RawTestCase): TestStatus {
  if (testcase.failure !== undefined || testcase.error !== undefined) return 'failed';
  if (testcase.skipped !== undefined) return 'skipped';
  return 'passed';
}

/** Parsea el contenido de un reporte JUnit XML (soporta raíz <testsuites> o <testsuite> suelta). */
export function parseJUnitXml(xml: string): TestResult[] {
  const doc = parser.parse(xml) as RawDocument;

  const suites: RawTestSuite[] = doc.testsuites
    ? toArray(doc.testsuites.testsuite)
    : toArray(doc.testsuite);

  const results: TestResult[] = [];

  for (const suite of suites) {
    const suiteName = suite['@_name'] ?? '';
    for (const testcase of toArray(suite.testcase)) {
      results.push({
        suite: suiteName,
        testName: testcase['@_name'] ?? '',
        status: statusOf(testcase),
        duration: Number(testcase['@_time'] ?? 0),
      });
    }
  }

  return results;
}

export function parseJUnitFile(filePath: string): TestResult[] {
  return parseJUnitXml(readFileSync(filePath, 'utf-8'));
}
