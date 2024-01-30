export const arrayUniqueByKey = <T extends { [key: string]: any }>(array: T[], key: string): T[] => [
	...new Map(
		array.map((item) => {
			return [item[key], item];
		})
	).values(),
];
