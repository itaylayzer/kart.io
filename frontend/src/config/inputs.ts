import { InputAxis } from "@/types/InputAxis";
import { InputTrigger } from "@/types/InputTrigger";

export const AXISES: InputAxis[] = [
    { name: "horizontal", positive: [68], negative: [65], smoothness: 0.1 },
    { name: "vertical", positive: [87], negative: [83], smoothness: 0.1 },
];

export const TRIGGERS: InputTrigger[] = [{ name: "jump", key: [32] }];
