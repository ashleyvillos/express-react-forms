import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
  Spacer
} from "@chakra-ui/react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { User } from "../../types";
import axios from 'axios'
import { Spinner } from '@chakra-ui/react'

const Posts: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [users, setUsers] = useState<User[]>(props.users);
  const [actionType, setActionType] = useState('add')
  const [spinnerLoading, setSpinnerLoading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal
  } = useDisclosure()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<User>();

  const handleSearch = async (search: string) => {
    const resUsers = await fetch(
      `https://63438d663f83935a78552378.mockapi.io/user?search=${search}`
    );
    setUsers(await resUsers.json());
    setSelectedIndex(0)
  };

  const onSubmit: SubmitHandler<User> = async (data) => {
    try {
      setSpinnerLoading(true)
      await fetch(`https://63438d663f83935a78552378.mockapi.io/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((data) => {
        if (data.ok) {
          reset();
          onClose();
          setSpinnerLoading(false)
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onEdit: SubmitHandler<User> = async (data) => {
    setSpinnerLoading(true)
    axios({
      url: `https://63438d663f83935a78552378.mockapi.io/user/46`,
      data: data,
      method: 'put'
    }).then((res) => {
      if (res.status == 200) {
        reset()
        onClose()
        fetchUsers()
        setSpinnerLoading(false)
      }
    }).catch((err) => {
      console.log(err)
      onClose()
      setSpinnerLoading(false)
    })
  };
  
  const fetchUsers = async () => {
    axios({
      url: "https://63438d663f83935a78552378.mockapi.io/user",
      method: 'get'
    }).then((res) => {
      if (res.status == 200) {
        setUsers(res.data)
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleDelete = async (id: number) => {
    axios({
      url: `https://63438d663f83935a78552378.mockapi.io/user/${id}`,
      method: 'delete'
    }).then((res) => {
      if (res.status == 200) {
        fetchUsers()
        onCloseDeleteModal()
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  useEffect(() => console.log(errors), [errors]);

  const DeleteModal = () => {
    return (
      <Modal isOpen={isOpenDeleteModal} onClose={onCloseDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are you sure you want to delete { users[selectedIndex] !== undefined ? users[selectedIndex].name : '' }?</ModalHeader>
          <ModalCloseButton />
          <ModalFooter gap={2}>
            <Button bg={"orange"} type="submit" onClick={() => handleDelete(users[selectedIndex].id)}>
              Yes
            </Button>
            <Button onClick={onCloseDeleteModal}>No</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  const AddEditModal = () => {
    // console.log(users[selectedIndex])
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as={"form"} onSubmit={handleSubmit((actionType == 'add') ? onSubmit : onEdit)}>
          {/* <ModalHeader>USER FORM {users[selectedIndex].name}</ModalHeader> */}
          <ModalHeader>USER FORM</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <Input
                // value={users[selectedIndex].name} # only works once. State change works in ModalHeader but not in this component. 
                placeholder="Name"
                {...register("name", { required: true })}
              />
              <Input
                // value={users[selectedIndex].username} # only works once. State change works in ModalHeader but not in this component
                placeholder="Username"
                {...register("username", { required: true })}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button bg={"orange"} type="submit" disabled={spinnerLoading}>
              <Text mr={3}>Submit</Text> 
              <Spinner hidden={!spinnerLoading} />
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <>
      <Box w={"full"} h={"fit-content"}>
        <Flex>
          <Input
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search"
            mr={3}
          />
          <Button 
            bg={"blue.500"} 
            fontSize={"2xl"} 
            onClick={() => {
              setActionType('add')
              onOpen()
            }}
          >
            +
          </Button> 
        </Flex>
        <Divider />
        <List>
          {users.map((user, index) => (
            <ListItem key={user.id}>
              <Link href={`/users/${user.id}`}>
                <Flex
                  borderColor={"indigo"}
                  borderWidth={2}
                  borderRadius={"xl"}
                  m={2}
                  p={4}
                  alignItems={"center"}
                  gap={2}
                >
                  <div>
                    <Text>
                      {user.name}
                      {""}
                    </Text>
                    <Text as={"small"} color={"orange"}>
                      @{user.username}
                    </Text>
                  </div>
                  <Spacer />
                  <div>
                    <Button 
                      bg={"orange"} 
                      fontSize={"sm"} 
                      onClick={(e) => {
                        e.stopPropagation()
                        setActionType('edit')
                        setSelectedIndex(index)
                        onOpen()
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      bg={"red.400"} 
                      ml={2}
                      fontSize={"sm"} 
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedIndex(index)
                        onOpenDeleteModal()
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Flex>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
      {/* MODAL FORM  */}
      {/* <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>USER FORM</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <Input
                placeholder="Name"
                {...register("name", { required: true })}
              />
              <Input
                placeholder="Username"
                {...register("username", { required: true })}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button bg={"orange"} type="submit">
              Submit {selectedIndex}
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
      <AddEditModal />
      <DeleteModal />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const resUsers = await fetch(
    "https://63438d663f83935a78552378.mockapi.io/user"
  );
  const users = await resUsers.json();
  return { props: { users: users } };
};

export default Posts;
