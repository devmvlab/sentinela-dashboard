import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { categories } from "../utils/categoriesList";
import { buildIncidentCategories } from "../utils/categoriesHelpers";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [state, setState] = useState({
		loading: true,
		isAuthenticated: false,
	});

	// =============================
	// AUTH LOAD
	// =============================
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				setState({
					loading: false,
					isAuthenticated: false,
				});
				return;
			}

			try {
				const userRef = doc(db, "users", firebaseUser.uid);
				const userSnap = await getDoc(userRef);
				if (!userSnap.exists())
					throw new Error("Usuário não encontrado");

				const userData = userSnap.data();

				const settingsRef = doc(
					db,
					"users",
					firebaseUser.uid,
					"settings",
					"default",
				);

				const settingsSnap = await getDoc(settingsRef);
				const incidentTypes = settingsSnap.exists()
					? settingsSnap.data().incidentTypes || []
					: [];

				const incidentCategories = buildIncidentCategories(
					categories,
					incidentTypes,
				);

				setState({
					uid: firebaseUser.uid,
					name: userData.displayName,
					email: userData.email,
					photoURL: firebaseUser.photoURL,
					role: userData.role,
					cityId: userData.cityId || null,
					center:
						userData.coordinates?.latitude &&
						userData.coordinates?.longitude
							? {
									lat: userData.coordinates.latitude,
									lng: userData.coordinates.longitude,
								}
							: null,
					incidentTypes,
					incidentCategories,
					loading: false,
					isAuthenticated: true,
				});
			} catch (err) {
				console.error("AuthProvider error:", err);
				setState({
					loading: false,
					isAuthenticated: false,
				});
			}
		});

		return () => unsubscribe();
	}, []);

	// =============================
	// ACTIONS
	// =============================
	const updateIncidentTypes = async (newIncidentTypes) => {
		if (!state.uid) return;

		const settingsRef = doc(db, "users", state.uid, "settings", "default");

		// 1️⃣ Persiste
		await setDoc(
			settingsRef,
			{ incidentTypes: newIncidentTypes },
			{ merge: true },
		);

		// 2️⃣ Recalcula categories
		const incidentCategories = buildIncidentCategories(
			categories,
			newIncidentTypes,
		);

		// 3️⃣ Atualiza state
		setState((prev) => ({
			...prev,
			incidentTypes: newIncidentTypes,
			incidentCategories,
		}));
	};

	return (
		<AuthContext.Provider
			value={{
				...state,
				updateIncidentTypes,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
