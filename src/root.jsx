import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

const router = createBrowserRouter([
	// 🔹 Tela de login (sem Layout)
	{
		path: "/",
		element: <Login />,
	},

	// 🔒 Rotas protegidas
	{
		path: "/dashboard",
		element: (
			<ProtectedRoute>
				<Layout />
			</ProtectedRoute>
		),
		children: [
			{
				path: "",
				element: <Dashboard />,
			},
			{
				path: "ocorrencias",
				element: <div>Ocorrências</div>,
			},
			{
				path: "usuarios",
				element: <div>Usuários</div>,
			},
		],
	},
]);

export default function Root() {
	return <RouterProvider router={router} />;
}
