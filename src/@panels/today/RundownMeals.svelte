<script lang="ts">
  import type { SchoolMeals } from '../../lib/tracked/schoolData';

  const USUALLY_PRESENT_MIN = 0.55;
  const IGNORED_CATEGORIES = new Set(['fruit', 'milk', 'vegetables', 'misc.']);
  const IGNORED_ITEMS = new Set(['refried beans', 'tater tots']);
  const COLD_PATTERNS = [
    /\bsalad\b/i,
    /\bwrap\b/i,
    /\bdeli\b/i,
    /\bsandwich\b/i,
    /\bparfait\b/i,
    /\byogurt\b/i,
    /\bprotein pack\b/i,
    /\bfasting\b/i,
    /\bpinwheel\b/i,
  ];

  const isLunch = (menu: string) => /\blunch\b/i.test(menu);

  const isIgnored = (category: string, item: string) =>
    IGNORED_CATEGORIES.has(category.toLowerCase()) ||
    IGNORED_ITEMS.has(item.toLowerCase()) ||
    /\bsmoothie\b/i.test(item) ||
    /\biced latte\b/i.test(item);

  const categorize = (menu: string, category: string, item: string) => {
    if (isIgnored(category, item)) return null;
    if (!isLunch(menu)) return 'Entrees';
    return category == 'Grab and Go' || COLD_PATTERNS.some((p) => p.test(item)) ? 'Cold' : 'Warm';
  };

  const formatLabel = (menu: string, section: string) => {
    const base = /\bbreakfast\b/i.test(menu) ? 'Breakfast' : isLunch(menu) ? 'Lunch' : menu;
    return section == 'Entrees'
      ? `${base} today`
      : `${section} ${base} today`.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  let {
    day,
    meals,
    mealsWithImages,
  }: { day: string; meals: SchoolMeals; mealsWithImages: string[] } = $props();

  let groups = $derived.by(() => {
    const totalDays = new Set(
      Object.values(meals)
        .flatMap((item) => Object.values(item))
        .flatMap(({ days }) => days),
    ).size;

    const sections: Record<string, { unusual: string[]; missing: string[] }> = {};

    for (const [item, menuEntries] of Object.entries(meals))
      for (const [menu, { category, days }] of Object.entries(menuEntries)) {
        const section = categorize(menu, category, item);
        if (!section) continue;
        const key = `${menu}\0${section}`;
        const entry = (sections[key] ??= { unusual: [], missing: [] });
        if (days.includes(day) && days.length / totalDays <= USUALLY_PRESENT_MIN)
          entry.unusual.push(item);
        if (!days.includes(day) && days.length / totalDays > USUALLY_PRESENT_MIN)
          entry.missing.push(item);
      }

    return Object.entries(sections).sort(([a], [b]) => a.localeCompare(b));
  });
</script>

{#snippet meal(m: string, last: boolean)}
  <!-- todo render servedWith -->
  <a
    href={mealsWithImages.includes(m)
      ? `https://raw.githubusercontent.com/KTibow/school-districts-data/refs/heads/main/data/%2Bimages/${encodeURIComponent(
          m,
        )}.png`
      : undefined}
    target="_blank">{m}</a
  >{#if !last}{', '}{/if}
{/snippet}

{#each groups as [key, { unusual, missing }]}
  {@const label = formatLabel(key.split('\0')[0], key.split('\0')[1])}
  {#if unusual.length || missing.length}
    <section>
      <div class="menu">{label}</div>
      {#if unusual.length}
        <p>
          {#each unusual as m, i}
            {@render meal(m, i == unusual.length - 1)}
          {/each}
        </p>
      {/if}
      {#if missing.length}
        <p>
          {'Missing usual: '}
          {#each missing as m, i}
            {@render meal(m, i == missing.length - 1)}
          {/each}
        </p>
      {/if}
    </section>
  {/if}
{/each}

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: 0.75rem;
    background-color: var(--m3c-surface-container-highest);
    color: var(--m3c-on-surface-variant);
  }
  [href] {
    color: var(--m3c-secondary);
  }
  .menu {
    @apply --m3-label-medium;
  }
  p {
    @apply --m3-body-small;
  }
</style>
