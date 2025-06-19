export const formatCollectionName = (name: string) => {
  if (!name) return '';
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
