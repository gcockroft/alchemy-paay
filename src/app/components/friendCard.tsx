import React from "react";


interface FriendCardProps {
  name: string;
  onClick: (to: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({name, onClick}) => {
  return (
    <div className="flex flex-row h-8 border border-l-0 border-r-0">
      <p className="justify-self-start">{name}</p>
      <button className="btn-small" onClick={() => onClick(name)}>Select</button>
    </div>
  )
}

export default FriendCard;