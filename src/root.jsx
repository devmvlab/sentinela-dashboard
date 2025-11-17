import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Login />,
	},
	{
		path: "/dashboard",
		element: <Dashboard />,
	},
]);

export default function Root() {
	return <RouterProvider router={router} />;
}
