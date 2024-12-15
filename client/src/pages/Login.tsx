import { Box, Button } from '@mantine/core';

import { useActionState } from 'react';
import { useNavigate } from 'react-router';

export const Login = () => {
  const navigate = useNavigate();
  const [_data, action, _isPending] = useActionState(
    async (_previousState: any, _formData: any) => {
      navigate('/main');
    },
    null
  );

  return (
    <div style={{ height: '100vh' }}>
      <Box
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          textAlign: 'center',
        }}
      >
        <div>
          <h1>Login</h1>
          <form action={action}>
            <Button type="submit">Log in</Button>
          </form>
        </div>
      </Box>
    </div>
  );
};
