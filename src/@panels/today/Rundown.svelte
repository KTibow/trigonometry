<script lang="ts">
  import RundownMeals from './RundownMeals.svelte';
  import { getTodayKey } from '../../lib/today.svelte';
  import { districtData } from '../../lib/tracked/districtData';
  import { schoolData } from '../../lib/tracked/schoolData';

  let { path }: { path: string } = $props();
  let currentDay = $derived(path.match(/^Present\/([0-9]{4}-[0-9]{2}-[0-9]{2})\.md$/)?.[1]);
</script>

{#if currentDay}
  {@const alertsToday = currentDay == getTodayKey() ? ($districtData.data?.alerts ?? []) : []}
  {@const meals = $schoolData.data?.meals || {}}
  {@const mealsWithImages = $schoolData.data?.mealsWithImages || []}
  {@const weatherToday = $schoolData.data?.weather?.[currentDay]}
  {#each alertsToday as alert}
    <div class="card alert">{alert}</div>
  {/each}
  <RundownMeals day={currentDay} {meals} {mealsWithImages} />
  {#if weatherToday}
    <div class="card">{weatherToday}</div>
  {/if}
{/if}

<style>
  .card {
    @apply --m3-body-small;
    display: flex;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--m3c-primary-container-subtle);
    color: var(--m3c-on-primary-container-subtle);
  }
  .alert {
    background-color: var(--m3c-error-container-subtle);
    color: var(--m3c-on-error-container-subtle);
  }
</style>
