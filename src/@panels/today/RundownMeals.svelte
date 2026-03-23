<script lang="ts">
  import type { Listing, SchoolMenus } from '../../lib/tracked/schoolData';

  const USUALLY_PRESENT_MIN = 0.55;
  const IGNORED_SECTIONS = new Set(['fruit', 'milk', 'vegetables', 'misc.']);
  const IGNORED_ITEMS = new Set([
    '1% white milk',
    'apple',
    'apple juice',
    'applesauce cups, flavored',
    'baby carrots',
    'baked bbq beans',
    'broccoli salad',
    'canned sliced pears',
    'coleslaw',
    'cucumbers',
    'dried cranberries',
    'edamame',
    'fresh orange',
    'fruit punch',
    'green peas',
    'ketchup',
    'mustard',
    'non fat white milk',
    'nsd burger sauce',
    'peach cup',
    'pickled onions',
    'pico de gallo',
    'ranch dressing',
    'refried beans',
    'salad mix',
    'salsa',
    'shredded lettuce',
    'sliced jalapenos',
    'strawberries',
    'sweet apple topping',
    'tartar sauce',
    'tater tots',
  ]);
  const COLD_PATTERNS = [
    /\bsalad\b/i,
    /\bwrap\b/i,
    /\bdeli\b/i,
    /\bsandwich\b/i,
    /\bparfait\b/i,
    /\byogurt\b/i,
    /\bprotein pack\b/i,
    /\bpinwheel\b/i,
  ];

  const isLunch = (menu: string) => /\blunch\b/i.test(menu);

  const isIgnored = (section: string, item: string) =>
    IGNORED_SECTIONS.has(section.toLowerCase()) ||
    IGNORED_ITEMS.has(item.toLowerCase()) ||
    /\bfasting\b.*\bpack\b/i.test(item) ||
    /\bsmoothie\b/i.test(item) ||
    /\biced latte\b/i.test(item);

  const categorize = (menu: string, section: string, item: string) => {
    if (isIgnored(section, item)) return null;
    if (!isLunch(menu)) return 'Entrees';
    return section == 'Grab and Go' || COLD_PATTERNS.some((p) => p.test(item)) ? 'Cold' : 'Warm';
  };

  const groupItems = (menu: string, listing: Record<string, string[]>) => {
    const grouped: Record<string, string[]> = {};
    for (const [section, items] of Object.entries(listing)) {
      for (const item of [...new Set(items)]) {
        const cat = categorize(menu, section, item);
        if (!cat) continue;
        if (!(grouped[cat] ??= []).includes(item)) grouped[cat].push(item);
      }
    }
    return grouped;
  };

  const sectionOrder = (menu: string, sections: string[]) =>
    isLunch(menu)
      ? sections.sort(
          (a, b) => ['Warm', 'Cold'].indexOf(a) - ['Warm', 'Cold'].indexOf(b) || a.localeCompare(b),
        )
      : sections.sort((a, b) => a.localeCompare(b));

  const formatMenuLabel = (menu: string, section: string, totalSections: number) => {
    const base = /\bbreakfast\b/i.test(menu)
      ? 'Breakfast'
      : /\blunch\b/i.test(menu)
        ? 'Lunch'
        : menu;
    if (totalSections <= 1) return `${base} today`;
    return isLunch(menu) ? `${section} lunch today` : `${section} ${menu} today`;
  };

  type MealsByDay = Record<string, { menu: string; listing: Listing }[]>;

  const getMealsByDay = (menus: SchoolMenus) => {
    const mealsByDay: MealsByDay = {};
    for (const [menu, days] of Object.entries(menus)) {
      for (const [day, listing] of Object.entries(days)) {
        (mealsByDay[day] ||= []).push({ menu, listing });
      }
    }

    return Object.fromEntries(
      Object.entries(mealsByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, meals]) => [
          day,
          meals.sort((a, b) => a.menu.localeCompare(b.menu)),
        ]),
    ) satisfies MealsByDay;
  };

  let { day, menus }: { day: string; menus: SchoolMenus } = $props();
  let mealsByDay = $derived(getMealsByDay(menus));

  let cards = $derived.by(() => {
    const allDays = Object.keys(mealsByDay).sort();

    return (mealsByDay[day] ?? []).flatMap((meal) => {
      const history = allDays
        .map((d) => mealsByDay[d]?.find((m) => m.menu == meal.menu))
        .filter(Boolean)
        .map((entry) => groupItems(meal.menu, entry!.listing));

      const todayGrouped = groupItems(meal.menu, meal.listing);
      const allSections = sectionOrder(meal.menu, [
        ...new Set(history.flatMap((g) => Object.keys(g))),
      ]);

      return allSections.flatMap((section) => {
        const counts = new Map<string, number>();
        let sectionDays = 0;

        for (const day of history) {
          const items = day[section] ?? [];
          if (!items.length) continue;
          sectionDays++;
          for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
        }

        if (!sectionDays) return [];

        const todayItems = new Set(todayGrouped[section] ?? []);
        const unusual = [...todayItems]
          .filter((i) => (counts.get(i) ?? 0) / sectionDays <= USUALLY_PRESENT_MIN)
          .sort();
        const missing = [...counts.keys()]
          .filter((i) => counts.get(i)! / sectionDays > USUALLY_PRESENT_MIN && !todayItems.has(i))
          .sort();

        const notes = [
          ...(unusual.length ? [{ label: 'Unusual today', text: unusual.join(', ') }] : []),
          ...(missing.length ? [{ label: 'Missing usual', text: missing.join(', ') }] : []),
        ];

        return notes.length
          ? [{ label: formatMenuLabel(meal.menu, section, allSections.length), notes }]
          : [];
      });
    });
  });
</script>

{#each cards as { label, notes }}
  <section class="meal">
    <div class="menu">{label}</div>
    {#each notes as { label, text }}
      <p>{label == 'Unusual today' ? '' : `${label}: `}{text}</p>
    {/each}
  </section>
{/each}

<style>
  .meal {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: 0.75rem;
    background-color: var(--m3c-surface-container-highest);
    color: var(--m3c-on-surface-variant);
  }
  .menu {
    @apply --m3-label-medium;
  }
  p {
    @apply --m3-body-small;
  }
</style>
