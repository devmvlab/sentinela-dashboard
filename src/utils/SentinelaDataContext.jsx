import { createContext, useContext, useEffect, useState } from "react";
import { db, auth } from "../services/firebase";

import {
	collection,
	query,
	where,
	doc,
	getDoc,
	onSnapshot,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

// ======================================================
// CONTEXT
// ======================================================
const SentinelaDataContext = createContext(null);

// ======================================================
// PROVIDER
// ======================================================
export function SentinelaDataProvider({ children }) {
	const [user, setUser] = useState(null);
	const [userCity, setUserCity] = useState(null);
	const [userCenter, setUserCenter] = useState(null);

	const [incidents, setIncidents] = useState([]);
	const [loading, setLoading] = useState(true);

	const [incidentTypes, setIncidentTypes] = useState([]);

	useEffect(() => {
		if (!user?.uid) return;

		const onStorage = (e) => {
			if (e.key === "incidentTypesSyncing") {
				getDoc(doc(db, "users", user.uid, "settings", "default")).then(
					(snap) => {
						if (snap.exists()) {
							setIncidentTypes(snap.data().incidentTypes || []);
						}
					},
				);

				localStorage.removeItem("incidentTypesSyncing");
			}
		};

		window.addEventListener("storage", onStorage);

		return () => {
			window.removeEventListener("storage", onStorage);
		};
	}, [user]);

	useEffect(() => {
		let unsubscribeIncidents;

		// escuta o estado de autenticação
		const unsubscribeAuth = onAuthStateChanged(
			auth,
			async (currentUser) => {
				// usuário não logado
				if (!currentUser) {
					setUser(null);
					setUserCity(null);
					setUserCenter(null);
					setIncidents([]);
					setLoading(false);

					// encerra listener antigo
					if (typeof unsubscribeIncidents === "function") {
						unsubscribeIncidents();
						unsubscribeIncidents = null;
					}
					return;
				}

				try {
					setLoading(true);

					// =============================
					// BUSCAR USUÁRIO NO FIRESTORE
					// =============================
					const userRef = doc(db, "users", currentUser.uid);
					const userSnap = await getDoc(userRef);

					if (!userSnap.exists()) {
						console.warn("Usuário não encontrado no Firestore");
						setLoading(false);
						return;
					}

					const userData = userSnap.data();

					setUser({ ...userData, uid: currentUser.uid });
					setUserCity(userData.cityId || null);

					if (
						userData.coordinates?.latitude &&
						userData.coordinates?.longitude
					) {
						setUserCenter({
							lat: userData.coordinates.latitude,
							lng: userData.coordinates.longitude,
						});
					} else {
						setUserCenter(null);
					}
					// =============================
					// BUSCAR SETTINGS DO USUÁRIO
					// =============================
					const settingsRef = doc(
						db,
						"users",
						currentUser.uid,
						"settings",
						"default",
					);

					const settingsSnap = await getDoc(settingsRef);

					if (settingsSnap.exists()) {
						const settingsData = settingsSnap.data();
						setIncidentTypes(settingsData.incidentTypes || []);
					} else {
						setIncidentTypes([]);
					}

					// =============================
					// BUSCAR INCIDENTES DA CIDADE
					// =============================
					if (!userData.displayName) {
						console.warn("Usuário não possui displayName (cidade)");
						setIncidents([]);
						setLoading(false);
						return;
					}

					let q;

					if (userData.role === "SUPER_ADMIN") {
						q = query(collection(db, "incidents"));
					} else {
						q = query(
							collection(db, "incidents"),
							where("geoloc.cityId", "==", userData.cityId),
						);
					}

					// 🔔 LISTENER EM TEMPO REAL (ESSENCIAL PARA NOTIFICAÇÕES)
					unsubscribeIncidents = onSnapshot(q, (snapshot) => {
						const data = snapshot.docs.map((doc) => ({
							id: doc.id,
							...doc.data(),
						}));

						setIncidents(data);
						setLoading(false);
					});
				} catch (error) {
					console.error(
						"Erro ao carregar dados do Sentinela:",
						error,
					);
					setIncidents([]);
					setLoading(false);
				}
			},
		);

		return () => {
			unsubscribeAuth();
			if (typeof unsubscribeIncidents === "function") {
				unsubscribeIncidents();
			}
		};
	}, []);

	return (
		<SentinelaDataContext.Provider
			value={{
				user,
				userCity,
				userCenter,
				incidentTypes,
				setIncidentTypes,
				loading,
			}}
		>
			{children}
		</SentinelaDataContext.Provider>
	);
}

// ======================================================
// HOOK DE CONSUMO
// ======================================================
export function useSentinelaData() {
	const context = useContext(SentinelaDataContext);

	if (!context) {
		throw new Error(
			"useSentinelaData deve ser usado dentro de SentinelaDataProvider",
		);
	}

	return context;
}
