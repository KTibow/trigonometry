import { fn } from 'monoserve';
import { number, object, pipe, regex, string } from 'valibot';

type Listing = Record<string, string[]>;
type CurrentDisplayItem = {
  type: 'category' | 'recipe' | 'text';
  name: string;
};
type MenuData = {
  id: number;
  name: string;
};
type DateOverwriteData = {
  day: string;
  setting: string;
};

const input = object({
  districtBase: pipe(
    string(),
    regex(/^https:\/\/menus\.healthepro\.com\/api\/organizations\/\d+$/),
  ),
  schoolBase: pipe(
    string(),
    regex(/^https:\/\/menus\.healthepro\.com\/api\/organizations\/\d+\/sites\/\d+$/),
  ),
  year: number(),
  month: number(),
});

const cleanMenuName = (name: string) =>
  name.replace(/^\d+-\d+ /, '').replace(/^(?:Elementary|Middle|High) School /, '');

export default fn(input, async ({ districtBase, schoolBase, year, month }) => {
  const menusResponse = await fetch(`${schoolBase}/menus`);
  if (!menusResponse.ok) {
    throw new Response(`MSM is ${menusResponse.status}ing`, { status: 500 });
  }

  const { data: menus } = (await menusResponse.json()) as { data: MenuData[] };
  const output: Record<string, { menu: string; listing: Listing }[]> = {};
  const monthPath = `year/${year}/month/${month}`;

  for await (const { id, name } of menus) {
    const response = await fetch(`${districtBase}/menus/${id}/${monthPath}/date_overwrites`);
    if (!response.ok) {
      throw new Response(`MSM is ${response.status}ing`, { status: 500 });
    }

    const { data } = (await response.json()) as { data: DateOverwriteData[] };
    for (const { day, setting } of data) {
      const currentDisplay = (JSON.parse(setting) as { current_display?: CurrentDisplayItem[] })
        .current_display;
      if (!currentDisplay?.length) {
        continue;
      }

      const listing: Listing = {};
      let category = '';

      for (const item of currentDisplay) {
        if (item.type == 'category') {
          category = item.name;
          continue;
        }

        if (item.type != 'recipe') {
          continue;
        }

        (listing[category || 'Items'] ||= []).push(item.name);
      }

      if (Object.keys(listing).length == 0) {
        continue;
      }

      (output[day] ||= []).push({ menu: cleanMenuName(name), listing });
    }
  }

  return output;
});
