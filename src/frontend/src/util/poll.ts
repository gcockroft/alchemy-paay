export async function pollForLambdaForComplete(
  lambda: () => Promise<boolean>,
  txnMaxDurationSeconds: number = 20,
) {
  let txnRetryCount = 0;
  let reciept;
  do {
    reciept = await lambda();
    if (!reciept) {
      // wait 1 second before trying again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (!reciept && txnRetryCount++ < txnMaxDurationSeconds);
  if (!reciept) {
    throw new Error("Timedout waiting for processs completion.");
  }
  return reciept;
}
