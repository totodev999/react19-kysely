import {
  Box,
  Button,
  Group,
  Modal,
  Radio,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import axios, { AxiosError } from 'axios';
import React, { useActionState } from 'react';
import { Link } from 'react-router';

export const Search = () => {
  const [searchResult, setSearchResult] = React.useState<{ content: string }[]>(
    []
  );
  const [modalText, setModalText] = React.useState<string>('');
  const [data, action, isPending] = useActionState(
    async (
      _previousState: null | {
        error?: string;
        success: boolean;
      },
      formData: FormData
    ) => {
      const method = formData.get('method') as string | null;
      const searchText = formData.get('searchText') as string | null;
      if (!method || !searchText) {
        return { error: 'Method and Search text is required', success: false };
      }

      const url =
        method === 'fullText'
          ? '/api/to-do/full-text-search'
          : '/api/to-do/vector-search';

      try {
        const result = await axios.post<{ content: string }[]>(url, {
          search: searchText,
        });
        setSearchResult(result.data);
        return { success: true };
      } catch (e: unknown) {
        if (e instanceof AxiosError) {
          const errorMessage = e.response?.data ?? 'server error';
          return { error: errorMessage, success: false };
        }
        return { error: 'unknown error', success: false };
      }
    },
    null
  );

  return (
    <div>
      <Box ta="center">
        <h1>Search</h1>
        <p>You can search for contents by 2 ways.</p>
        <p>1 full text search</p>
        <p>2 semantic search</p>
        <Link to="/main">Insert</Link>
      </Box>
      <Box w={{ base: '80%', lg: '50%' }} ta="center" mx="auto" mt={20}>
        <form action={action}>
          <Group justify="center" mb={10}>
            <Radio
              label="full text search"
              name="method"
              value="fullText"
              defaultChecked
            />
            <Radio label="semantic search" name="method" value="semantic" />
          </Group>
          <TextInput name="searchText" mb={10} />
          <Button type="submit" disabled={isPending}>
            Search
          </Button>
        </form>
        {data?.success ? <p>Success</p> : <p>{data?.error}</p>}
      </Box>
      <Box w={{ base: '80%' }} mx="auto">
        {searchResult.length > 0 && (
          <Text>
            Search Result{' '}
            <Text span c="blue" fw="bold">
              {searchResult.length}
            </Text>{' '}
            contents
          </Text>
        )}
        <ul>
          {searchResult?.map((data, index) => (
            <UnstyledButton
              key={index}
              onClick={() => setModalText(data.content)}
              mb={20}
            >
              <li>
                <Text lineClamp={4}>{data.content}</Text>
              </li>
            </UnstyledButton>
          ))}
        </ul>
      </Box>
      {modalText && (
        <Modal
          opened={!!modalText}
          onClose={() => setModalText('')}
          size="100%"
        >
          {modalText}
        </Modal>
      )}
    </div>
  );
};
