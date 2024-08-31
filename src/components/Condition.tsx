import { ReactNode } from "react";

export function Condition({
  conditions,
  onFalse,
  onTrue,
}: {
  conditions: boolean;
  onTrue: ReactNode;
  onFalse?: ReactNode;
}) {
  return [onFalse ?? <></>, onTrue][+conditions];
}
