import {useCallback, useState} from "react";

export interface MultiActionStep<Identiifer, Context> {
  percent: number;
  description: string | JSX.Element;
  title: string;
  identifier: Identiifer;
  context: Partial<Context>;
}

export interface MultiActionError {
  cause: {
    code: number;
    message: string;
  };
  metaMessages: string[];
}

export function useMultiActionOrchestrator<
  Data,
  StepIdentifier extends string | number | symbol,
  Context,
>(
  data: Data,
  startStep: MultiActionStep<StepIdentifier, Context>,
  handlers: Record<
    StepIdentifier,
    (
      data: Data,
      context: Partial<Context>,
    ) => Promise<MultiActionStep<StepIdentifier, Context>>
  >,
) {
  const [currentStep, updateStep] =
    useState<MultiActionStep<StepIdentifier, Context>>();

  const reset = useCallback(() => updateStep(undefined), []);

  const go = useCallback(async () => {
    try {
      let inMemStep = currentStep;
      async function _updateStep(
        step: MultiActionStep<StepIdentifier, Context>,
      ) {
        const assembledContext = {
          ...inMemStep?.context,
          ...step.context,
        };
        const resolvedStep: MultiActionStep<StepIdentifier, Context> = {
          ...step,
          context: assembledContext,
        };
        inMemStep = resolvedStep;
        updateStep(resolvedStep);
      }

      while (inMemStep?.percent !== 100) {
        await handlers[inMemStep?.identifier ?? startStep.identifier](
          data,
          inMemStep?.context ?? startStep.context,
        )
          .then((step) => _updateStep(step))
          .catch((e) => {
            console.error(e);
            throw e;
          });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [currentStep, data, handlers, startStep]);

  return {
    currentStep: currentStep ?? startStep,
    go,
    reset,
  };
}
