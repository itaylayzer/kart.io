export function getNameFromURL() {
  const name = new URLSearchParams(window.location.search).get("name")!;
  return name ?? "";
}
