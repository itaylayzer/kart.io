export function getNameFromURL() {
  return decodeURIComponent(window.location.pathname.split("/").at(-1)!);
}
