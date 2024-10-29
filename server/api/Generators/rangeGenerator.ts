const COLORS_LENGTH = 8;


export function createColorGenerator() {

    let colorIndex = 0;

    return () => {
        const old = colorIndex % COLORS_LENGTH;
        colorIndex++;
        return old;
    }
}