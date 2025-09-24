export default function windowEvent<K extends keyof WindowEventMap>(
    element: Window | HTMLElement,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any
) {
    // @ts-ignore
    element.addEventListener(type, listener);
    return () => {
        // @ts-ignore
        element.removeEventListener(type, listener);
    };
}
