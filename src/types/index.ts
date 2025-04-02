export function isSortOrder(value: string): value is 'asc' | 'desc' {
  return value === 'asc' || value === 'desc';
}
