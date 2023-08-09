import React from "react";

interface KeypadButtonProps {
  onClick: (num: number) => void;
  num: number;
}

const KeypadButton: React.FC<KeypadButtonProps> = ({onClick, num}) => {
  return (
    <button className="h-10 w-10 rounded-full border-2 border-blue-700 text-blue-700 font-semibold active:bg-blue-700 active:text-white hover:bg-slate-50 m-2" onClick={() => onClick(num)}>
      {num}
    </button>
  )
}

export default KeypadButton;