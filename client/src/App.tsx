import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./Home";
import Login from "./Login";

function App() {
  const router = createBrowserRouter([
    { path: "/home", Component: Home },
    { path: "/", Component: Login },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
