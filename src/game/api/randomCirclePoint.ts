export function randomCirclePoint(radius: number): { x: number; y: number } {
    // Generate a random angle in radians
    const angle = Math.random() * 2 * Math.PI;

    // Calculate x and y based on the angle and radius
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    return { x, y };
}
