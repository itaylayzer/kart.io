export function createIDGenerator() {
    let nextId = 0;

    return () => {
        const old = nextId;
        nextId++;
        return old;
    };
}