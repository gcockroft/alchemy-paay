import KeypadButton from "@/app/components/Keypad/keypadButton";

interface KeypadProps {
  onClick: (num: number) => void;
}

const Keypad: React.FC<KeypadProps> = ({onClick}) => {
  return (
    <div className="flex flex-col content items-center h-full w-full">
      <div className="flex flex-row">
        <KeypadButton onClick={onClick} num={1}/>
        <KeypadButton onClick={onClick} num={2}/>
        <KeypadButton onClick={onClick} num={3}/>
      </div>
      <div className="flex flex-row">
        <KeypadButton onClick={onClick} num={4}/>
        <KeypadButton onClick={onClick} num={5}/>
        <KeypadButton onClick={onClick} num={6}/>
      </div>
      <div className="flex flex-row justify-between">
        <KeypadButton onClick={onClick} num={7}/>
        <KeypadButton onClick={onClick} num={8}/>
        <KeypadButton onClick={onClick} num={9}/>
      </div>
      <KeypadButton onClick={onClick} num={0}/>
    </div>
  )
};

export default Keypad;
