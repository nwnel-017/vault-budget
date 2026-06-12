export function getSearchParamValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}
