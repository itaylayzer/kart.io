export function almostZero(num: number, threshold: number = 0.01) {
    return Math.abs(num) < threshold;
}
