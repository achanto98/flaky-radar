import { readFileSync } from 'fs';
import path from 'path';
import { parseJUnitXml } from '../src/parseJUnit';

function fixture(name: string): string {
  return readFileSync(path.join(__dirname, 'fixtures', name), 'utf-8');
}

describe('parseJUnitXml', () => {
  it('parses jest-junit style reports wrapped in <testsuites>', () => {
    const results = parseJUnitXml(fixture('jest.xml'));
    expect(results).toEqual([
      { suite: 'src/math.test.ts', testName: 'adds numbers', status: 'passed', duration: 0.01 },
      { suite: 'src/math.test.ts', testName: 'subtracts numbers', status: 'failed', duration: 0.02 },
    ]);
  });

  it('parses pytest style reports with a bare root <testsuite>', () => {
    const results = parseJUnitXml(fixture('pytest.xml'));
    expect(results).toEqual([
      { suite: 'pytest', testName: 'test_add', status: 'passed', duration: 0.001 },
      { suite: 'pytest', testName: 'test_sub', status: 'failed', duration: 0.002 },
      { suite: 'pytest', testName: 'test_skip', status: 'skipped', duration: 0 },
    ]);
  });

  it('returns an empty array when there are no testsuites', () => {
    expect(parseJUnitXml('<testsuites></testsuites>')).toEqual([]);
  });

  it('treats <error> the same as <failure>', () => {
    const xml =
      '<testsuite name="s"><testcase name="t" time="0.1"><error message="boom"/></testcase></testsuite>';
    expect(parseJUnitXml(xml)).toEqual([{ suite: 's', testName: 't', status: 'failed', duration: 0.1 }]);
  });
});
