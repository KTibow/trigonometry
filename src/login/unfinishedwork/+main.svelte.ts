import { verify } from '@tsndr/cloudflare-worker-jwt';
import studentvue from 'fast-studentvue';
import {
  deleteVerification,
  getAuthOrUndefined,
  getVerificationOrUndefined,
  setVerification,
  type Auth,
} from '../../lib/strg/common.svelte';
import verifyStudentvueRemote from './verify-studentvue.remote';
import { untrack } from 'svelte';
import { trackProgress } from '../../lib/progress.svelte';
import verificationPublicKey from '../../lib/verification/public-key';

type VerificationPayload = {
  verification?: { method?: string };
};

const addVerification = async (auth: Auth) => {
  const tokenData = await studentvue(
    auth,
    () => {
      location.hash = 'login';
      throw new Error('relogging');
    },
    'GenerateAuthToken',
    {
      Username: '',
      TokenForClassWebSite: 'true',
      DocumentID: '1',
      AssignmentID: '1',
    },
  );
  const token = tokenData.AuthToken['@_EncyToken'];

  const jwt = await verifyStudentvueRemote({ email: auth.email, token });
  setVerification(jwt);
};

const cleanup = $effect.root(() => {
  $effect(() => {
    const auth = getAuthOrUndefined();
    const verification = getVerificationOrUndefined();
    if (auth && !verification) {
      untrack(() => trackProgress('Verifying your identity', addVerification(auth)));
    }
  });
  $effect(() => {
    const auth = getAuthOrUndefined();
    const verification = getVerificationOrUndefined();

    if (auth && verification) {
      untrack(async () => {
        try {
          const decoded = await verify<VerificationPayload>(verification, verificationPublicKey, {
            algorithm: 'ES256',
            throwError: true,
          });
          const payload = decoded!.payload;
          if (payload.sub != auth.email || typeof payload.verification?.method != 'string') {
            throw new Error('bad payload');
          }
        } catch {
          deleteVerification();
        }
      });
    }
  });
});
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
