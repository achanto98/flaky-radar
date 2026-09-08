import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    const junitPath = core.getInput('junit-path', { required: true });
    core.info(`FlakyRadar: junit-path=${junitPath}`);

    // Pasos siguientes del plan (ver FlakyRadar-brief-arranque-v0.md, sección 6):
    // 2. parseJUnit.ts, 3. history.ts, 4. flakiness.ts, 5-6. report.ts

    core.setOutput('flaky-count', '0');
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
