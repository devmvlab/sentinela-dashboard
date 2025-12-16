import { createContext, useContext, useEffect, useState } from "react";
import { db, auth } from "../services/firebase";

import {
	collection,
	query,
	where,
	getDocs,
	doc,
	getDoc,
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

	function updateIncidentStatus(id, newStatus) {
		setIncidents((prev) =>
			prev.map((inc) =>
				inc.id === id ? { ...inc, status: newStatus } : inc
			)
		);
	}

	useEffect(() => {
		// escuta o estado de autenticação corretamente
		const unsubscribeAuth = onAuthStateChanged(
			auth,
			async (currentUser) => {
				// usuário ainda não logado
				if (!currentUser) {
					setUser(null);
					setUserCity(null);
					setUserCenter(null);
					setIncidents([]);
					setLoading(false);
					return;
				}

				try {
					setLoading(true);

					// =============================
					//  BUSCAR USUÁRIO NO FIRESTORE
					// =============================
					const userRef = doc(db, "users", currentUser.uid);
					const userSnap = await getDoc(userRef);

					if (!userSnap.exists()) {
						console.warn("Usuário não encontrado no Firestore");
						setLoading(false);
						return;
					}

					const userData = userSnap.data();

					setUser(userData);
					setUserCity(userData.displayName || null);

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
					//  BUSCAR INCIDENTES DA CIDADE
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
							where("geoloc.city", "==", userData.displayName)
						);
					}

					const snapshot = await getDocs(q);

					const data = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}));

					setIncidents(data);
				} catch (error) {
					console.error(
						"Erro ao carregar dados do Sentinela:",
						error
					);
					setIncidents([]);
				} finally {
					setLoading(false);
				}
			}
		);

		return () => unsubscribeAuth();
	}, []);

	return (
		<SentinelaDataContext.Provider
			value={{
				user,
				userCity,
				userCenter,
				incidents,
				loading,
				updateIncidentStatus,
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
			"useSentinelaData deve ser usado dentro de SentinelaDataProvider"
		);
	}

	return context;
}
