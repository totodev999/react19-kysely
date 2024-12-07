import { AppShell, Center, Stack } from '@mantine/core';
import axios from 'axios';
import { useActionState, useState } from 'react';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Geo {
  lat: string;
  lng: string;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

interface FormError {
  error: {
    name?: {
      message: string;
    };
    displayName?: {
      message: string;
    };
    id?: {
      message: string;
    };
  };
}

export const Home = () => {
  const [defaultValue, setDefaultValue] = useState<{
    name?: string;
    displayName?: string;
    id?: number;
  }>({
    name: undefined,
    displayName: undefined,
    id: undefined,
  });
  const [data, submitAction, isPending] = useActionState(
    async (
      _previousState: User[] | FormError | undefined,
      formData: FormData
    ) => {
      const name = formData.get('name') as string;
      const displayName = formData.get('displayName') as string;
      const id = formData.get('id') as string;

      const errors: FormError['error'] = {};

      if (!name) {
        errors.name = { message: 'Name is required' };
      }
      if (!displayName) {
        errors.displayName = { message: 'DisplayName is required' };
      }
      if (!id) {
        errors.id = { message: 'ID is required' };
      }

      if (Object.keys(errors).length > 0) {
        setDefaultValue({
          name: name,
          displayName: displayName,
          id: Number(id),
        });

        return { error: errors };
      }

      const user = await axios.get<User[]>(
        'https://jsonplaceholder.typicode.com/users'
      );

      const match = [];

      const matchedName = user.data.filter((user) => user.name.includes(name));
      const matchedDisplayName = user.data.filter((user) =>
        user.username.includes(displayName)
      );
      const matchedId = user.data.filter((user) => user.id === Number(id));
      match.push(...matchedName, ...matchedDisplayName, ...matchedId);
      const deleteDuplicatedUser = new Map(
        match.map((user) => [user.id, user])
      );

      return Array.from(deleteDuplicatedUser.values());
    },
    undefined
  );

  console.log(isPending);
  console.log(data);
  const formError = data && 'error' in data ? data.error : undefined;

  return (
    <>
      <title>Home</title>
      <meta name="author" content="Josh" />
      <AppShell header={{ height: 50 }}>
        <AppShell.Header>
          <Center h="100%">React19</Center>
        </AppShell.Header>
        <AppShell.Main>
          <div>
            <h1>New Features in this page</h1>
            <ul>
              <li>meta and title see html</li>
              <li>form, useActionState</li>
            </ul>
            <Center>
              <p>
                return data which match name, userName, id from{' '}
                <a
                  href="https://jsonplaceholder.typicode.com/users"
                  target="_blank"
                  referrerPolicy="no-referrer"
                >
                  jsonplaceholder/user
                </a>
              </p>
            </Center>
            <form action={submitAction}>
              <Stack w="50%" mx="auto">
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  defaultValue={defaultValue.name}
                />
                {formError?.name && <p>{formError.name.message}</p>}

                <input
                  type="text"
                  placeholder="DisplayName"
                  name="displayName"
                  defaultValue={defaultValue.displayName}
                />
                {formError?.displayName && (
                  <p>{formError.displayName.message}</p>
                )}

                <input
                  type="number"
                  placeholder="ID"
                  name="id"
                  defaultValue={defaultValue.id}
                />
                {formError?.id && <p>{formError.id.message}</p>}

                <button type="submit" disabled={isPending}>
                  submit
                </button>
              </Stack>
            </form>

            <Center>
              <ul>
                {Array.isArray(data) &&
                  data.map((user) => (
                    <li key={user.id}>
                      {user.id}|{user.name}|{user.username}
                    </li>
                  ))}
              </ul>
            </Center>
          </div>
        </AppShell.Main>
      </AppShell>
    </>
  );
};
