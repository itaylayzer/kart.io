export default function clamp(val: number, min: number, max: number) {
    if (!Number.isFinite(val)) return min;
    return Math.max(Math.min(val, max), min);
}
