import {useState, useCallback, ChangeEvent, FormEvent, useEffect} from "react";
import {
  Input,
  Button,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  Heading,
  TagLabel,
  TagCloseButton,
  Tag,
  FormHelperText,
  Flex,
  Box,
} from "@chakra-ui/react";
import {
  AdminMemberUpdateResponse,
  AdminMemberUpdateType,
  BaseMember,
} from "../../declarations/api";
import {useAdminMemberQuery} from "../../clients/admin";
import {LoadingScreen} from "../../screens/LoadingScreen";
import {ErrorScreen} from "../../screens/ErrorScreen";
import {UseMutationResult, useMutation} from "@tanstack/react-query";
import {
  adminCreateMember,
  adminDeleteMember,
  adminUpdateMember,
} from "../../http/endpoints";
import {queryClient} from "../../clients/query";
import {Link, useNavigate, useParams} from "react-router-dom";
import {ChevronRightIcon} from "@chakra-ui/icons";
import {isEqual} from "lodash";

interface MemberFormProps {
  member?: Omit<BaseMember, "id" | "aboutMeMd">;
  mutation: UseMutationResult<
    AdminMemberUpdateResponse,
    unknown,
    AdminMemberUpdateType,
    unknown
  >;
}

function MemberFormInternal({member, mutation}: MemberFormProps) {
  const [formData, setFormData] = useState<AdminMemberUpdateType>(
    member ? {...member} : {},
  );
  const [permissionInput, setPermissionInput] = useState<string>("");

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const {name, value} = e.target;
      let v: string | null = value;
      if (
        (name === "credentialContext" || name === "ethAddress") &&
        value === ""
      ) {
        v = null;
      }
      setFormData((prevData) => ({
        ...prevData,
        [name]: v,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      mutation.mutate(formData);
    },
    [formData, mutation],
  );

  const handlepermissionInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPermissionInput(e.target.value);
    },
    [],
  );

  const handleAddTag = useCallback(() => {
    if (
      permissionInput.trim() !== "" &&
      !formData.permissions?.includes(permissionInput.trim())
    ) {
      setFormData((prevData) => ({
        ...prevData,
        permissions: [...(prevData.permissions ?? []), permissionInput.trim()],
      }));
      setPermissionInput("");
    }
  }, [permissionInput, formData.permissions]);

  const handleRemoveTag = useCallback((removedTag: string) => {
    setFormData((prevData) => ({
      ...prevData,
      permissions: prevData.permissions?.filter((tag) => tag !== removedTag),
    }));
  }, []);

  return (
    <form style={{width: "80%"}} onSubmit={handleSubmit}>
      <FormControl marginTop={2}>
        <FormLabel>Email</FormLabel>
        <Input
          type="text"
          id="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl marginTop={2}>
        <FormLabel>Start Date</FormLabel>
        <Input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate || ""}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl marginTop={2}>
        <FormLabel>ETH Address</FormLabel>
        <Input
          type="text"
          id="ethAddress"
          name="ethAddress"
          value={formData.ethAddress || ""}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl marginTop={2}>
        <FormLabel>Credential Context</FormLabel>
        <Input
          type="text"
          id="credentialContext"
          name="credentialContext"
          value={formData.credentialContext || ""}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl marginTop={2}>
        <FormLabel>Member Status</FormLabel>
        <Select
          id="memberStatus"
          name="memberStatus"
          value={formData.memberStatus || ""}
          onChange={handleChange}
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
          <option value="pending">Pending</option>
        </Select>
      </FormControl>
      <FormControl marginTop={2}>
        <FormLabel>Permissions</FormLabel>
        <FormHelperText marginBottom={1}>
          Type in a permission and press enter to add it.
        </FormHelperText>
        <Input
          type="text"
          id="permissions"
          name="permissions"
          value={permissionInput}
          onChange={handlepermissionInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
        />
        {formData.permissions?.map((tag) => (
          <Tag
            key={tag}
            size="md"
            borderRadius="full"
            variant="solid"
            colorScheme="blue"
            mt={2}
            margin={1}
          >
            <TagLabel>{tag}</TagLabel>
            <TagCloseButton onClick={() => handleRemoveTag(tag)} />
          </Tag>
        ))}
      </FormControl>
      <br />
      <Text color="GrayText">
        Make changes to the member to submit an update
      </Text>
      <Button
        type="submit"
        isLoading={mutation.isLoading}
        isDisabled={isEqual(formData, member)}
      >
        Submit
      </Button>
      {mutation.isError && (
        <Text color="red">
          Something went wrong. Please try again.
          <br />
          {`${mutation.error}`}
        </Text>
      )}
    </form>
  );
}

export function MemberUpdateForm() {
  const memberQuery = useAdminMemberQuery();
  const navigate = useNavigate();
  const {slug} = useParams();

  const title = memberQuery.data?.email ? `${memberQuery.data.email}` : "User";

  // Ensure a fresh member is fetched on load or when slug changes
  useEffect(() => {
    queryClient.invalidateQueries(["member", `${slug}`]);
  }, [slug]);

  const memberMutation = useMutation(
    (member: AdminMemberUpdateType) => {
      return adminUpdateMember(slug!, member);
    },
    {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(["member", `${slug}`]),
          queryClient
            .invalidateQueries(["admin_member", `${slug}`])
            .then(async () => {
              await queryClient.invalidateQueries([
                "admin_member",
                memberQuery.data?.id,
              ]);
            }),
        ]);
        alert("Member updated successfully");
      },
    },
  );

  const memberDeleteMutation = useMutation(
    () => {
      return adminDeleteMember(slug!);
    },
    {
      onSuccess: () => {
        alert("Member deleted successfully");
        queryClient.invalidateQueries(["admin_members"]);
        navigate("/admin/members");
      },
    },
  );

  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
      >
        <BreadcrumbItem>
          <Link to="/admin">Admin</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to="/admin/members">Members</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Link to={`/admin/member/${slug}`}>{title}</Link>
        </BreadcrumbItem>
      </Breadcrumb>
      <VStack marginLeft="2rem" marginRight="2rem" gap={4} alignItems="start">
        <Flex width="100%" alignItems="center" justifyContent="space-between">
          <Box>
            <Heading>{title}</Heading>
            <Heading color="GrayText" size="sm">
              (id: {memberQuery.data?.id})
            </Heading>
          </Box>
          <Button
            isLoading={memberDeleteMutation.isLoading}
            colorScheme="red"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete this member? This action cannot be undone.",
                )
              ) {
                memberDeleteMutation.mutate();
              }
            }}
          >
            Delete
          </Button>
        </Flex>
        {memberQuery.isLoading ? (
          <LoadingScreen />
        ) : !memberQuery.data ? (
          <ErrorScreen error="Member not found" />
        ) : (
          <MemberFormInternal
            mutation={memberMutation}
            member={memberQuery.data}
          />
        )}
      </VStack>
    </>
  );
}

export function MemberCreateForm() {
  const title = "Create new Member";
  const navigate = useNavigate();
  const memberMutation = useMutation(adminCreateMember, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin_members"]).then(() => {
        alert("Member created successfully");
        navigate(`/admin/member/${data.id}`);
      });
    },
  });
  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
      >
        <BreadcrumbItem>
          <Link to="/admin">Admin</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to="/admin/members">Members</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Link to={`/admin/member/create`}>Create</Link>
        </BreadcrumbItem>
      </Breadcrumb>
      <VStack
        marginLeft="2rem"
        marginRight="2rem"
        gap={4}
        width="100%"
        alignItems="start"
      >
        <Heading>{title}</Heading>
        <MemberFormInternal mutation={memberMutation} />
      </VStack>
    </>
  );
}
