import React from "react";


interface FriendCardProps {
  name: string;
  onClick: (to: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({name, onClick}) => {
  return (
    <div className="flex h-11 border-b border-l-0 border-r-0 content-center justify-between">
      <span className="flex self-center pl-1">{name}</span>
      <button className="btn-small" onClick={() => onClick(name)}>Select</button>
    </div>
  )
}

export default FriendCard;