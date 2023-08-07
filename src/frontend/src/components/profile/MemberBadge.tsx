import {memo, useCallback, useRef, useState} from "react";
import card from "../../assets/card.png";
import {Member} from "../../declarations/api";
import {Box, Heading, Img} from "@chakra-ui/react";

function memberNumberFormat(memberNumber: number): string {
  const str = `${memberNumber}`.padStart(15, "0");
  return (
    str.substring(0, 4) +
    " " +
    str.substring(4, 10) +
    " " +
    str.substring(10, str.length)
  );
}

function memberDateFormat(startDate: string): string {
  const date = new Date(startDate);
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
  });
}

function UnmemoBadge({
  member,
  shouldTilt,
}: {
  member?: Member;
  shouldTilt: boolean;
}) {
  const [tilt, setTilt] = useState({x: 0, y: 0});
  const [shimmerTilt, setShimmerTilt] = useState({x: 0, y: 0});
  const [isHovering, setIsHovering] = useState(false);
  const [reset, setReset] = useState<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setIsHovering(true);
      reset && clearTimeout(reset);
      if (!cardRef.current) return;
      const cardRect = cardRef.current?.getBoundingClientRect();
      const cardCenter = {
        x: cardRect.left + cardRect.width / 2,
        y: cardRect.top + cardRect.height / 2,
      };
      const mousePosition = {
        x: e.clientX,
        y: e.clientY,
      };

      const tiltAmountX = 24; // Adjust this value to control the tilt intensity
      const tiltAmountY = 16; // Adjust this value to control the tilt intensity

      const tilt = {
        x: ((mousePosition.x - cardCenter.x) / cardRect.width) * tiltAmountX,
        y: ((mousePosition.y - cardCenter.y) / cardRect.height) * tiltAmountY,
      };

      setTilt(tilt);
      setShimmerTilt({
        x: ((mousePosition.x - cardCenter.x) / cardRect.width) * 100,
        y: ((mousePosition.y - cardCenter.y) / cardRect.height) * 100,
      });
    },
    [reset],
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setReset(
      setTimeout(() => {
        setShimmerTilt({x: 0, y: 0});
        setTilt({x: 0, y: 0});
        setReset(undefined);
      }, 300),
    );
  }, []);

  const shouldAnmiateReturn = !isHovering || !shouldTilt;

  return (
    <Box
      position="relative"
      borderRadius={20}
      willChange={"transform"}
      boxShadow="0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
      style={{
        transform: shouldTilt
          ? `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`
          : `rotateY(${0}deg) rotateX(${0}deg)`,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
      overflow={"hidden"}
      transition={shouldAnmiateReturn ? "transform 0.3s ease" : undefined}
    >
      <Box
        className="shimmer"
        position="absolute"
        top="0"
        left="0"
        w="200%"
        h="200%"
        filter={"blur(3px)"}
        opacity={shouldTilt ? 1 : 0}
        background="linear-gradient(45deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.35) 100%)"
        transition={shouldAnmiateReturn ? "all .3s ease" : "opacity 1s ease"}
        zIndex={1}
        style={{
          transform: `translateX(${shimmerTilt.x}px) translateY(${shimmerTilt.y}px) translateX(-62%) translateY(-62%) rotate(-45deg)`,
        }}
      />
      <Img src={card} style={{height: 310}} alt="card" />
      <Img
        width="135px"
        height="135px"
        top="26px"
        right="26px"
        borderRadius="50%"
        position="absolute"
        alt="profile"
        src={member?.imageUrl}
      />
      <Box position="absolute" top="26px" left="26px">
        <Heading
          size="lg"
          fontFamily="Inconsolata"
          fontStyle="bold"
          fontWeight={400}
          textAlign="start"
          padding={0}
          margin={0}
          textShadow="0 2px 2px rgba(255, 255, 255, .3)"
        >
          {member?.firstName?.toLocaleUpperCase()}{" "}
          {member?.lastName?.toLocaleUpperCase()}
          <br />
          EST. {member?.startDate && memberDateFormat(member.startDate)}
        </Heading>
      </Box>
      <Box position="absolute" bottom="30px" left="110px">
        <Heading
          size="lg"
          fontFamily="Inconsolata"
          fontStyle="bold"
          fontWeight={400}
          textAlign="start"
          padding={0}
          margin={0}
          textShadow="0 2px 2px rgba(255, 255, 255, .3)"
        >
          ALCHEMY MEMBER
          <br />
          <Box
            fontFamily={"Inconsolata"}
            fontStyle={"normal"}
            fontWeight={400}
            fontSize={"23px"}
            textShadow="0 2px 2px rgba(255, 255, 255, .3)"
          >
            {member && memberNumberFormat(member.id)}
          </Box>
        </Heading>
      </Box>
    </Box>
  );
}

export const MemberBadge = memo(UnmemoBadge);
