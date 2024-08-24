export function getNameFromURL(){
    return window.location.pathname.split('/').at(-1)!;
}