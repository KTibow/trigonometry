import { verify } from '@tsndr/cloudflare-worker-jwt';
import { untrack } from 'svelte';
import { studentvueOrRelog } from '../studentvue';
import { getAuthOrUndefined } from '../strg/common.svelte';
import verificationPublicKey from '../verification/public-key';
import { makeTracked, versionedCache } from './_lib.svelte';
import verifyStudentvueRemote from './_verify-studentvue.remote';

type VerificationPayload = {
  verification?: { method?: string };
};

const addVerification = async (email: string, signal: AbortSignal) => {
  const tokenData = await studentvueOrRelog<{
    AuthToken: {
      '@_EncyToken': string;
    };
  }>(
    'GenerateAuthToken',
    {
      Username: '',
      TokenForClassWebSite: 'true',
      DocumentID: '1',
      AssignmentID: '1',
    },
    signal,
  );
  const token = tokenData.AuthToken['@_EncyToken'];

  return await verifyStudentvueRemote({ email, token });
};

const assertVerification = async (jwt: string, email: string) => {
  const decoded = await verify<VerificationPayload>(jwt, verificationPublicKey, {
    algorithm: 'ES256',
    throwError: true,
  });
  const payload = decoded!.payload;

  if (payload.sub != email || typeof payload.verification?.method != 'string') {
    throw new Error('bad payload');
  }
};

const [verification, stop] = makeTracked<string>({
  label: 'Verifying your identity',
  run: () => {
    const email = getAuthOrUndefined()?.email;
    if (!email) {
      return undefined;
    }

    const cache = versionedCache<string>('verification', email);
    const cachedJwt = untrack(cache.read);

    return {
      cache,
      load: async (signal) => {
        if (cachedJwt) {
          try {
            await assertVerification(cachedJwt, email);
            return cachedJwt;
          } catch {}
        }

        return await addVerification(email, signal);
      },
    };
  },
});

import.meta.hot?.dispose(stop);

export { verification };
