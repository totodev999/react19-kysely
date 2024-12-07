import { useEffect } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigation,
} from 'react-router';
import { Home } from './pages/Home';

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
