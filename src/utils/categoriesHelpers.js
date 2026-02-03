import { categories } from "./categoriesList";

export const categoriesOptions = categories.map((c) => ({
	value: c.title,
	label: c.title,
}));

export const typesOptions = categories.flatMap((c) =>
	c.items.map((item) => ({
		value: item.title,
		label: item.title,
		category: c.title,
		isEmergency: Boolean(item.isEmergency),
	})),
);
