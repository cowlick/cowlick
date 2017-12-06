"use strict";
import * as ora from "ora";

export type Run<T> = (text: string, run: () => T) => T;

export function runProgress<T>(text: string, run: () => T): T {
  const spinner = ora(text).start();
  try {
    const result = run();
    spinner.color = "green";
    spinner.succeed();
    return result;
  } catch (e) {
    spinner.fail();
    throw e;
  }
}
