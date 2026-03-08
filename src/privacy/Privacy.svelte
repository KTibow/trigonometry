<svelte:head>
  <title>Privacy</title>
  <style>
    body {
      background-color: var(--m3c-surface-container-lowest);
    }
  </style>
</svelte:head>

<article>
  <p>Trigonometry is designed to know as little about you as possible.</p>

  <h2>Your password doesn't touch our servers</h2>
  <p>
    Your StudentVue password is saved on your device and sent directly to StudentVue, never sent to
    our servers.
  </p>
  <p>
    <em
      >You can check this yourself. Read
      <a href="https://github.com/KTibow/trigonometry">our open source code</a>, or open your
      browser's Network panel to see what gets sent where.</em
    >
  </p>

  <h2>Then how does logging in work?</h2>
  <ul>
    <li>Your browser gets a temporary token from StudentVue using your local credentials.</li>
    <li>That token is sent to our servers to verify your identity.</li>
    <li>We give you persistent identification (a JWT) and discard the temporary token.</li>
    <li>This identification gives you a personal, isolated storage bucket (Cloudflare R2).</li>
  </ul>

  <h2>What our servers don't save</h2>
  <ul>
    <li>
      <strong>Your StudentVue password:</strong> It doesn't touch our servers.
    </li>
    <li>
      <strong>Schoology credentials:</strong> Stored on your device. They're used to fetch fresh data
      via our servers, but aren't saved on our end.
    </li>
    <li>
      <strong>Temporary login tokens:</strong> Discarded after verification.
    </li>
    <li>
      <strong>Your JWT:</strong> Generated and verified by our servers, but stored in your browser.
    </li>
  </ul>

  <h2>What our servers do save</h2>
  <ul>
    <li>
      <strong>Your synced data:</strong> things like your chat messages and preferences, saved to your
      personal storage bucket.
    </li>
    <li>
      <strong>Analytics:</strong> like what parts of the app are most used and worth developing on.
    </li>
    <li>
      <strong>AI chat logs:</strong> chats with free AI providers are logged to prevent abuse.
    </li>
  </ul>
</article>

<style>
  article {
    display: flex;
    flex-direction: column;

    width: min(calc(100% - 1rem), 41rem);
    align-self: center;
    margin-block: 3rem;
    padding: 1rem;
    border-radius: 1.5rem;
    background-color: var(--m3c-surface);

    > :not(:first-child) {
      margin-top: 1rem;
    }
    > h2 {
      @apply --m3-title-large;
    }
    > ul {
      list-style: inside;
    }
    a {
      color: var(--m3c-primary);
    }
  }
</style>
