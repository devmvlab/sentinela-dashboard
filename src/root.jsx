import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Incidents from "./pages/Incidents";
import Alerts from "./pages/Alerts";

const router = createBrowserRouter([
	// 🔹 Tela de login (sem Layout)
	{
		path: "/",
		element: <Login />,
	},

	// 🔒 Rotas protegidas
	{
		path: "",
		element: (
			<ProtectedRoute>
				<Layout />
			</ProtectedRoute>
		),
		children: [
			{
				path: "/dashboard",
				element: <Dashboard />,
			},
			{
				path: "/ocorrencias",
				element: <Incidents />,
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
