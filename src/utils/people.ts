/** Returns a copy of the names sorted alphabetically (case-insensitive). */
export const sortPeople = (people: string[]): string[] =>
  [...people].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
