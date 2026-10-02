import * as Sentry from "@sentry/nextjs";

/** Awaits server data for a section; a failure is reported and becomes null. */
export async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return null;
  }
}
