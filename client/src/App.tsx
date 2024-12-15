import { useEffect } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigation,
} from 'react-router';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Main } from './pages/Main';
import { Search } from './pages/Search';

function ComponentsWrapper() {
  const navigation = useNavigation();

  useEffect(() => {
    // do something when path changes
    console.log(navigation.location);
  }, [navigation.location]);

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <ComponentsWrapper />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/main',
        element: <Main />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/test',
        element: <div>Test</div>,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
