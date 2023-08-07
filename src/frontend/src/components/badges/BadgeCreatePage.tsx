import {useState} from "react";
import {
  Button,
  FormControl,
  FormLabel,
  VStack,
  Input,
  Textarea,
  Text,
  Image,
  HStack,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Heading,
  Divider,
} from "@chakra-ui/react";
import {ChevronRightIcon} from "@chakra-ui/icons";
import {Link, useNavigate} from "react-router-dom";
import {BadgeAttribute, BadgeCreateData} from "../../declarations/api";
import {MultiActionProgressModal} from "../common/MultiActionProgressModal";
import {queryClient} from "../../clients/query";
import {useBadgeCreationMutation} from "../../clients/nfts";

const badgeCreationBreadcrumb = ({
  helperText,
  context,
}: {
  helperText?: string;
  context: {
    metadata: {
      title: string;
      description: string;
      attributes: BadgeAttribute[];
      image: string;
    };
    metadataUrl: string;
  };
}) => {
  return (
    <>
      <Text>{helperText}</Text>
      <Link to={context.metadataUrl} target="_blank">
        <HStack>
          <Image
            justifyContent={"start"}
            src={context.metadata.image}
            minH="75px"
            minW="75px"
            maxH="75px"
            maxW="75px"
            objectFit="cover"
            borderRadius="md"
            backgroundColor="gray.300"
          />
          <Box>
            <Heading>{context.metadata.title}</Heading>
            <Text color="gray.400" as="span">
              {context.metadata.description}
            </Text>
          </Box>
        </HStack>
      </Link>
    </>
  );
};

export const BadgeCreatePage = () => {
  const [badgeCreateData, setBadgeCreateData] = useState<BadgeCreateData>({
    title: "",
    description: "",
    attributes: [],
    image: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const {mutation, reset, currentStep} = useBadgeCreationMutation(
    badgeCreateData,
    badgeCreationBreadcrumb,
  );

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setBadgeCreateData((prevData) => ({...prevData, image: file}));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the metadata to mint an NFT or perform any other desired action
    mutation.mutate();
  };

  const handleAttributeChange = (index: number, attribute: string) => {
    setBadgeCreateData((prevData) => {
      const updatedAttributes = [...prevData.attributes];
      updatedAttributes[index] = {...updatedAttributes[index], attribute};
      return {...prevData, attributes: updatedAttributes};
    });
  };

  const handleValueChange = (index: number, value: string) => {
    setBadgeCreateData((prevData) => {
      const updatedAttributes = [...prevData.attributes];
      updatedAttributes[index] = {...updatedAttributes[index], value};
      return {...prevData, attributes: updatedAttributes};
    });
  };

  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        padding="0"
      >
        <BreadcrumbItem>
          <Link to="/badges">Badges</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/badges/create`}>Create</Link>
        </BreadcrumbItem>
      </Breadcrumb>
      <Box
        paddingLeft={["1rem", "1rem", "4rem", "4rem", "4rem"]}
        paddingRight={["1rem", "1rem", "4rem", "4rem", "4rem"]}
        paddingTop="1rem"
        paddingBottom="2rem"
      >
        <HStack w="100%" gap={2} alignItems="center">
          <Image />
          <Box flex="1">
            <Heading display="flex" alignItems="center" gap="5px">
              Create a new badge!
            </Heading>
            <Text color="gray.500" style={{margin: 0}}>
              Create a new badge applishment that can be sent to fellow
              Alchemists!
            </Text>
          </Box>
        </HStack>
        <Divider variant="dashed" color="gray.200" />
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl alignSelf={"center"}>
              <FormLabel>Image</FormLabel>
              <HStack alignItems={"start"}>
                <Image
                  justifyContent={"start"}
                  src={previewImage ?? undefined}
                  minH="150px"
                  minW="150px"
                  maxH="150px"
                  maxW="150px"
                  objectFit="cover"
                  borderRadius="md"
                  backgroundColor="gray.300"
                />
                <Input
                  padding={1}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </HStack>
            </FormControl>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={badgeCreateData.title}
                onChange={(e) =>
                  setBadgeCreateData({
                    ...badgeCreateData,
                    title: e.target.value,
                  })
                }
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={badgeCreateData.description}
                onChange={(e) =>
                  setBadgeCreateData({
                    ...badgeCreateData,
                    description: e.target.value,
                  })
                }
                required
              />
            </FormControl>
            {badgeCreateData.attributes.map((attribute, index) => (
              <FormControl key={index}>
                <HStack>
                  <Box>
                    <FormLabel>Attribute</FormLabel>
                    <Input
                      value={attribute.attribute}
                      onChange={(e) =>
                        handleAttributeChange(index, e.target.value)
                      }
                      required
                    />
                  </Box>
                  <Box>
                    <FormLabel>Value</FormLabel>
                    <Input
                      value={attribute.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      required
                    />
                  </Box>
                  <Button
                    alignSelf={"flex-end"}
                    colorScheme="red"
                    type="button"
                    onClick={() =>
                      setBadgeCreateData((prevData) => ({
                        ...prevData,
                        attributes: prevData.attributes.filter(
                          (_, i) => i !== index,
                        ),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </HStack>
              </FormControl>
            ))}
            <HStack w="100%" justifyContent={"space-between"}>
              <Button
                isDisabled={
                  badgeCreateData.attributes.length >= 10 ||
                  badgeCreateData.attributes.some(
                    (attribute) => !attribute.attribute || !attribute.value,
                  )
                }
                alignSelf={"flex-start"}
                type="button"
                onClick={() =>
                  setBadgeCreateData((prevData) => ({
                    ...prevData,
                    attributes: [
                      ...prevData.attributes,
                      {attribute: "", value: ""},
                    ],
                  }))
                }
              >
                Add Attribute
              </Button>
              <Button
                isDisabled={
                  !badgeCreateData.title ||
                  !badgeCreateData.description ||
                  !badgeCreateData.image ||
                  badgeCreateData.attributes.some(
                    (attribute) => !attribute.attribute || !attribute.value,
                  )
                }
                alignSelf={"flex-end"}
                type="submit"
                colorScheme="blue"
                isLoading={mutation.isLoading}
              >
                Create Badge
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
      <MultiActionProgressModal
        multiActionMutation={mutation}
        currentStep={currentStep}
        onClose={() => {
          if (mutation.isSuccess) {
            queryClient.invalidateQueries(["badges"]);
            navigate("/badges");
          }
          reset();
        }}
      />
    </>
  );
};
