import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

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
				path: "/perfil",
				element: <Profile />,
			},
			{
				path: "/ocorrencias",
				element: <Incidents />,
			},
			{
				path: "/relatorios",
				element: <Reports />,
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
