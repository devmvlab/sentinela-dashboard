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
		type: item.type,
	})),
);

export const buildIncidentCategories = (categories, incidentTypes) => {
	if (!Array.isArray(incidentTypes) || incidentTypes.length === 0) {
		return [];
	}

	return categories
		.map((category) => {
			const allowedItems = category.items.filter((item) =>
				incidentTypes.includes(item.title),
			);

			if (allowedItems.length === 0) {
				return null;
			}

			return {
				...category,
				items: allowedItems,
			};
		})
		.filter(Boolean);
};
