import { config } from '../../../lib/strg/common.svelte';
import { today } from '../../../lib/today.svelte';
import { monthlyMeals, type MonthlyMeals } from '../../../lib/tracked/meals.svelte';
import { replaceRundownPart } from './_lib.svelte';

const BREAKFAST_LINE = /^- \*\*Breakfast:/;

const formatTodayKey = (today: Date) =>
  `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today
    .getDate()
    .toString()
    .padStart(2, '0')}`;

const formatCategoryLabel = (category: string) => category || 'Items';

const sameRecipes = (left: string[], right: string[]) =>
  left.length == right.length && left.every((recipe, index) => recipe == right[index]);

const dropDailyStaticCategories = (
  mealsByDay: MonthlyMeals,
  menuName: string,
  listing: Record<string, string[]>,
) =>
  Object.fromEntries(
    Object.entries(listing).filter(([category, recipes]) => {
      if (recipes.length == 0) {
        return false;
      }

      let sawMenu = false;
      for (const day of Object.values(mealsByDay)) {
        const menu = day.find((entry) => entry.menu == menuName);
        if (!menu) {
          continue;
        }

        sawMenu = true;
        if (!sameRecipes(menu.listing[category] || [], recipes)) {
          return true;
        }
      }

      return !sawMenu;
    }),
  );

const formatMealBlock = (label: string, listing: Record<string, string[]>) => {
  const groups = Object.entries(listing).filter(([, recipes]) => recipes.length > 0);
  if (groups.length == 0) {
    return [];
  }

  return [
    `**${label}:**\n${groups
      .map(([category, recipes]) => `\t**${formatCategoryLabel(category)}:** ${recipes.join(', ')}`)
      .join('\n')}`,
  ];
};

const mealLines = (mealsByDay: MonthlyMeals, today: Date, type: RegExp, label: string) => {
  const meal = (mealsByDay[formatTodayKey(today)] ?? []).find(({ menu }) => type.test(menu));
  if (!meal) {
    return [];
  }

  const listing = dropDailyStaticCategories(mealsByDay, meal.menu, meal.listing);
  if (Object.values(listing).every((recipes) => recipes.length == 0)) {
    return [];
  }

  return formatMealBlock(label, listing);
};

const stop = $effect.root(() => {
  $effect(() => {
    const currentDay = new Date(today.getTime());
    const mealsData = config['rundown/disable-breakfast'] ? undefined : monthlyMeals.current;

    replaceRundownPart(
      (line) => BREAKFAST_LINE.test(line),
      !mealsData || [0, 6].includes(currentDay.getDay())
        ? []
        : mealLines(mealsData, currentDay, /\bbreakfast\b/i, 'Breakfast'),
    );
  });

  $effect(() => {
    const currentDay = new Date(today.getTime());
    const mealsData = config['rundown/disable-lunch'] ? undefined : monthlyMeals.current;

    replaceRundownPart(
      (line) => /^- \*\*Lunch:/.test(line),
      !mealsData || [0, 6].includes(currentDay.getDay())
        ? []
        : mealLines(mealsData, currentDay, /\blunch\b/i, 'Lunch'),
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(stop);
}
