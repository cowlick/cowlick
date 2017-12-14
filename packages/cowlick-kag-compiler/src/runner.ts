"use strict";
import * as ora from "ora";

export type Run<T> = (text: string, run: () => Promise<T>) => Promise<T>;

export async function runProgress<T>(text: string, run: () => Promise<T>): Promise<T> {
  const spinner = ora(text).start();
  try {
    const result = await run();
    spinner.color = "green";
    spinner.succeed();
    return result;
  } catch (e) {
    spinner.fail();
    throw e;
  }
}
