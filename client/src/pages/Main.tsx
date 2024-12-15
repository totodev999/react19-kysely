import { Box, Button, Loader, Textarea } from '@mantine/core';
import axios, { AxiosError } from 'axios';
import { useActionState } from 'react';
import { Link } from 'react-router';

export const Main = () => {
  const [data, action, isPending] = useActionState(
    async (
      _previousState: null | { error?: string; success: boolean },
      formData: FormData
    ) => {
      const content = formData.get('content') as string | null;
      if (!content) {
        return { error: 'Content is required', success: false };
      }

      try {
        await axios.post('/api/to-do', { content });
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
        <h1>You can insert data</h1>
        <p>
          data will be transformed into vector and it can be used for semantic
          search
        </p>
        <p>
          And more, you can use full text search in japanese, thanks to pg_bigm.
        </p>
        <Link to="/search">Search</Link>
      </Box>
      <Box w={{ base: '80%', lg: '50%' }} ta="center" mx="auto">
        <form action={action}>
          <Textarea autosize minRows={2} name="content" />
          <Button
            type="submit"
            leftSection={isPending && <Loader size="sm" c="cyan" />}
            disabled={isPending}
          >
            Submit
          </Button>
        </form>
        {data?.success ? <p>Success</p> : <p>{data?.error}</p>}
      </Box>
    </div>
  );
};
