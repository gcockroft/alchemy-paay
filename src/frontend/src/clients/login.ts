import {useMemo} from "react";
import {
  MultiActionStep,
  useMultiActionOrchestrator,
} from "../components/common/MultiAction";
import {useMe} from "../context/me";
import {AppMemberStatus, Request} from "../declarations/api";
import {storeCredentialId, testCredentialIds} from "./credentials";
import {PasskeySigner} from "../erc4337/PasskeySigner";
import {arrayify} from "@ethersproject/bytes";
import {sendPasskeyRequest} from "../http/endpoints";

export enum LoginStepIdentifier {
  LOGIN = "LOGIN",
  NEW_PASSKEY = "NEW_PASSKEY",
  SEND_NEW_PASSKEY_REQUEST = "SEND_NEW_PASSKEY_REQUEST",
  STORE_CRED_ID = "STORE_CRED_ID",
  DONE = "DONE",
}

type LoginStepContext = {
  passkeySigner: PasskeySigner;
  request: Request;
};

type LoginData = {};

type LoginHandlers = Record<
  LoginStepIdentifier,
  (
    data: LoginData,
    context: Partial<LoginStepContext>,
  ) => Promise<MultiActionStep<LoginStepIdentifier, LoginStepContext>>
>;

export function useLoginOrchestrator() {
  const me = useMe();
  const loginHandlers: LoginHandlers = useMemo(() => {
    return {
      [LoginStepIdentifier.LOGIN]: async () => {
        if (me.status === AppMemberStatus.LOGGED_IN) {
          return {
            percent: 100,
            description: "DONE",
            title: "DONE",
            identifier: LoginStepIdentifier.DONE,
            context: {},
          };
        }
        // Check if credential exists
        const creds = Object.values(me.credentialMap);
        const available = await testCredentialIds(creds);
        if (available && creds.includes(available.credentialId)) {
          return {
            percent: 90,
            description: "Storing you Crednetial ID to your local device",
            title: "Storing Credentials",
            identifier: LoginStepIdentifier.STORE_CRED_ID,
            context: {
              passkeySigner: await PasskeySigner.load(
                available.credentialId,
                available.publicKey,
              ),
            },
          };
        } else if (available) {
          return {
            percent: 75,
            description:
              "Sending a passkey request to your device and email. Login into FAAM with a logged in device and approve the request.",
            title: "Approve the new Passkey",
            identifier: LoginStepIdentifier.SEND_NEW_PASSKEY_REQUEST,
            context: {
              passkeySigner: await PasskeySigner.load(
                available.credentialId,
                available.publicKey,
              ),
            },
          };
        } else {
          return {
            percent: 50,
            description: "Associating this device with your account",
            title: "New Passkey",
            identifier: LoginStepIdentifier.NEW_PASSKEY,
            context: {},
          };
        }
      },
      [LoginStepIdentifier.NEW_PASSKEY]: async () => {
        const passkeySigner = await PasskeySigner.create({
          displayName: me.email,
          id: arrayify(me.id),
          name: `${me.firstName} ${me.lastName}`,
        });
        return {
          percent: 75,
          description:
            "Sending a passkey request to your device and email. Login into FAAM with a logged in device and approve the request.",
          title: "Login and Approve the new Passkey",
          identifier: LoginStepIdentifier.SEND_NEW_PASSKEY_REQUEST,
          context: {
            passkeySigner,
          },
        };
      },
      [LoginStepIdentifier.SEND_NEW_PASSKEY_REQUEST]: async (_, context) => {
        const request = await sendPasskeyRequest(me, {
          credentialId: context.passkeySigner?.credentialId!,
          publicKey: await context.passkeySigner?.getPublicKey()!,
        });

        // Poll and wait for request to complete on this device
        let completed = false;
        while (!completed) {
          const r = await fetch(`/api/requests/${request.id}`);
          const data = await r.json();
          if (data.status === "completed") {
            completed = true;
          }

          if (data.status === "rejected") {
            throw new Error("Request was rejected");
          }
          // wait a few seconds
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        return {
          percent: 90,
          description: "Storing your Crednetial ID to the local device",
          title: "Storing Credentials",
          identifier: LoginStepIdentifier.STORE_CRED_ID,
          context: {
            request,
          },
        };
      },
      [LoginStepIdentifier.STORE_CRED_ID]: async (_, context) => {
        // TODO: Store the credential id to local storage.
        storeCredentialId(context.passkeySigner?.credentialId!);
        return {
          percent: 100,
          description: "DONE",
          title: "DONE",
          identifier: LoginStepIdentifier.DONE,
          context: {},
        };
      },
      [LoginStepIdentifier.DONE]: async () => {
        return {
          percent: 100,
          description: "DONE",
          title: "DONE",
          identifier: LoginStepIdentifier.DONE,
          context: {},
        };
      },
    };
  }, []);

  return useMultiActionOrchestrator<{}, LoginStepIdentifier, unknown>(
    {},
    {
      percent: 0,
      description: "Seeing if you have a credential...",
      title: "Checking Credentials",
      identifier: LoginStepIdentifier.LOGIN,
      context: {},
    },
    loginHandlers,
  );
}
