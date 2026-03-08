<script lang="ts">
  import page from './page.svelte';
  import pages, { type NavEntry } from './pages';
  import { getAuthOrUndefined } from './strg/common.svelte';
  import NavLogin from './NavLogin.svelte';
  import NavPrivacy from './NavPrivacy.svelte';

  let auth = $derived(getAuthOrUndefined());
</script>

<nav>
  {#if auth}
    TODO
  {:else if page.page == 'login'}
    <NavPrivacy />
  {:else}
    <NavLogin />
  {/if}
  <div>
    {#each pages.filter((p): p is NavEntry => p.length > 2) as [thisPage, _, title, description, path]}
      <a class:active={page.page == thisPage} href="/#{thisPage}">
        <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="currentColor">
          <path d={path} />
        </svg>
        <div class="tooltip">
          <p>{title}</p>
          <p class="description">{description}</p>
        </div>
      </a>
    {/each}
  </div>
</nav>

<style>
  nav {
    display: flex;
    height: 2.5rem;

    position: fixed;
    left: 50%;
    bottom: 0.5rem;
    translate: -50% 0;

    white-space: nowrap;
    pointer-events: none;
    z-index: 10;
    transition: var(--m3-easing);
  }
  nav:not(:hover) {
    opacity: 0.8;
  }
  nav > * {
    display: flex;
    border-radius: var(--m3-shape-full);
    background-color: --translucent(var(--m3c-on-surface), 0.2);
  }
  a {
    display: flex;
    align-items: center;
    padding-inline: 0.25rem;
    &:first-child {
      padding-inline-start: 0.5rem;
    }
    &:last-child {
      padding-inline-end: 0.5rem;
    }
    position: relative;

    transition: var(--m3-easing);

    &:hover,
    &:active,
    &:focus-visible {
      > svg {
        color: var(--m3c-secondary);
      }
    }
    &:not(.active) {
      pointer-events: auto;
    }
    &.active {
      > svg {
        color: var(--m3c-primary);
      }
    }
    &::before {
      position: absolute;
      inset: 0 0 -0.5rem 0;
      content: '';
    }
    > .tooltip {
      position: absolute;
      bottom: 100%;
      margin-bottom: 0.5rem;
      left: 50%;
      translate: -50% 0;

      pointer-events: none;

      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      border-radius: 1rem;
      background-color: var(--m3c-surface-container-highest);

      transition: opacity var(--m3-easing) 400ms;

      > .description {
        color: var(--m3c-on-surface-variant);
      }
    }
    &:not(:hover, :focus-visible) {
      > .tooltip {
        visibility: hidden;
        opacity: 0;
        transition: opacity var(--m3-easing);
      }
    }
  }
</style>
