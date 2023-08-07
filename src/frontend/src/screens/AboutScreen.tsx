import {
  Box,
  Link,
  Badge,
  Text,
  VStack,
  HStack,
  Heading,
} from "@chakra-ui/react";

function AboutScreen() {
  return (
    <Box p={4} textAlign="start">
      <Heading fontSize="3xl" fontWeight="bold">
        Welcome to Alchemy's Internal Profile Tool!
      </Heading>
      <Text mt={4} color="gray.500">
        Join us in revolutionizing smart contracts and experiencing innovation
        at its best!
      </Text>
      <Box
        background="yellow.100"
        marginBottom={5}
        padding={5}
        borderRadius={"5px"}
      >
        <Text mt={4}>
          <b>WARNING:</b> P.S. Since it's still early, there might be some bugs.
          We would greatly appreciate your thoughts, ideas, comments, or any
          issues you encounter. Feel free to flag them in the{" "}
          <code>
            <Link href="https://alchemyinsights.slack.com/archives/C036F0D7NQL">
              #alchemy-faam
            </Link>
          </code>{" "}
          channel. Your feedback is invaluable as we continue to enhance our
          infrastructure and improve this tool! ↗️ 🙏
        </Text>
      </Box>
      <Box
        background="gray.300"
        marginBottom={5}
        padding={5}
        borderRadius={"5px"}
      >
        <Heading fontSize="xl" fontWeight="bold">
          🙋 Why make this tool?
        </Heading>
        <Text size="lg" mt={4}>
          At Alchemy, we believe using web3 to make every day better, and this
          does this by using our cutting-edge account abstraction
          infrastructure, all in production! It goes beyond the an ordinary
          profile tool. 🚀 👀
          <br />
          <br />
          Once you log in, you'll discover a whole new world. Each Alchemy
          Co-Worker will have their very own Alchemy Smart Contract Wallet
          associated with their Alchemy Email!
        </Text>
      </Box>
      <Box
        background="gray.300"
        marginBottom={5}
        padding={5}
        borderRadius={"5px"}
      >
        <Heading fontSize="xl" fontWeight="bold">
          ⭐️ But wait, there's more.
        </Heading>
        <Text mt={4}>
          We're taking it a step further by introducing "Alchemy NFT Badges" and
          an About Me section! 🔥 These NFT badges and editable about me will be
          displayed right on your profile, showcasing your future achievements,
          contributions, and expertise within the company.
          <b>
            You can give out badges to fellow alchemists and receive badges from
            them too! 🤝
          </b>
        </Text>
        <b>This means we offer:</b>
        <VStack spacing={2} mt={4} alignItems="flex-start">
          <Badge colorScheme="blue">Profiles for all Alchemy Co-Workers</Badge>
          <Badge colorScheme="blue">
            Better Web 3 UX compared to Traditional Wallets
          </Badge>
          <Badge colorScheme="blue">
            "Now your wallet is unlocked with just a fingerprint."
          </Badge>
          <Badge colorScheme="blue">Seamless Transactions</Badge>
          <Badge colorScheme="blue">Enhanced Security</Badge>
          <Badge colorScheme="blue">
            Ability to send and receive Badges to co-workers
          </Badge>
        </VStack>
        <Text mt={4}>
          We hope you share our excitement for the possibilities that lie ahead.
          And this is just the beginning, and we can't wait to see this tool
          evolve and grow together. 💪 🌎
        </Text>
        <Text mt={4}>
          Access the Alchemy Internal Profile Tool by clicking this link:
          <Link
            color="blue.500"
            href="https://fam.corp.alchemyapi.io/profile/me"
          >
            https://fam.corp.alchemyapi.io/profile/me
          </Link>
          . Alternatively, if you have the{" "}
          <code>
            <Link href="https://ap3-internal.corp.alchemyapi.io/">
              🦍 ap3 tool
            </Link>
          </code>
          , simply use{" "}
          <b>
            <code>fam</code>
          </b>{" "}
          from your browser.
        </Text>
        <HStack mt={4} spacing={2}>
          <Badge colorScheme="purple">#AlchemyFAAM</Badge>
          <Badge colorScheme="purple">#SmartContractRevolution</Badge>
          <Badge colorScheme="purple">#InnovationAtItsBest</Badge>
        </HStack>
      </Box>

      <Text mt={4}>
        A big shout out to{" "}
        <Link color="blue.500" href="/profile/jay">
          @jay
        </Link>
        {", "}
        <Link color="blue.500" href="/profile/ava">
          @ava
        </Link>
        {", "}
        <Link color="blue.500" href="/profile/dan.coombs">
          @dan c
        </Link>
        {", "}
        <Link color="blue.500" href="/profile/michael.moldoveanu">
          @moldy
        </Link>
        {", "}
        and{" "}
        <Link color="blue.500" href="/profile/angelina">
          @angelina
        </Link>
        {", "}
        who all helped make this happen!
      </Text>
      <Text color="gray.500" mt={4}>
        Copyright (c) 2023 - Alchemy
      </Text>
    </Box>
  );
}

export default AboutScreen;
