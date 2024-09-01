import { useState } from "react";

export function useToggle(
  def: boolean = false
): [boolean, () => void, React.Dispatch<React.SetStateAction<boolean>>] {
  const [value, setValue] = useState<boolean>(def);

  const toggleFunction = () => setValue((old) => !old);

  return [value, toggleFunction, setValue];
}
