import { Box, Heading, List, ListItem, Text } from "@chakra-ui/react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { Post } from "../../types";

const Thread: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const posts: Post[] = props.posts;
  return (
    <Box>
      <List>
        {posts.map((post) => (
          <ListItem key={post.id}>
            <Box
              borderWidth={2}
              borderColor={"indigo"}
              borderRadius={"3xl"}
              p={8}
            >
              <Text>#{post.id}</Text>
              <Heading>{post.title}</Heading>
              <Text fontSize={"xl"}>{post.body}</Text>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const resPost = await fetch(
    `https://63438d663f83935a78552378.mockapi.io/user/${id}/post`
  );
  const posts = await resPost.json();
  return { props: { posts: posts } };
};

export default Thread;
