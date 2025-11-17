import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		onAuthStateChanged(auth, (u) => {
			if (!u) window.location.href = "/";
			else setUser(u);
		});
	}, []);

	if (!user) return <p>Carregando...</p>;

	return <h1>Dashboard Sentinela 🚨</h1>;
}
