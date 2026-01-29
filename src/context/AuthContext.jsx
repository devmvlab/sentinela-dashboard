import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../constants/firebaseConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [settings, setSettings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [authError, setAuthError] = useState(null);

	useEffect(() => {
		let unsubscribeSettings = null;
		let unsubscribeUserDoc = null;

		const unsubscribeAuth = onAuthStateChanged(
			auth,
			async (firebaseUser) => {
				if (!firebaseUser) {
					setUser(null);
					setSettings(null);
					setAuthError(null);
					setLoading(false);
					return;
				}

				try {
					const userRef = doc(db, "users", firebaseUser.uid);
					const userSnap = await getDoc(userRef);

					if (!userSnap.exists()) {
						await signOut(auth);
						setAuthError("Usuário sem cadastro no sistema.");
						setLoading(false);
						return;
					}

					if (userSnap.data().isAdmin === true) {
						await signOut(auth);
						setAuthError(
							"Este usuário não tem permissão para acessar o app.",
						);
						setLoading(false);
						return;
					}

					setAuthError(null);
					setUser(firebaseUser);

					// 🔔 Listener do documento principal
					unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
						const userData = snap.exists() ? snap.data() : {};
						setUser((prev) => ({
							...firebaseUser,
							...userData,
							settings: prev?.settings || {},
						}));
					});

					// 🔔 Listener das configurações
					const settingsRef = doc(
						db,
						"users",
						firebaseUser.uid,
						"settings",
						"default",
					);

					unsubscribeSettings = onSnapshot(settingsRef, (snap) => {
						if (snap.exists()) {
							setSettings(snap.data());
						} else {
							setSettings({ radiusKm: 10, categoryStates: {} });
						}
					});
				} catch (err) {
					await signOut(auth);
					setAuthError("Erro ao validar usuário.");
				} finally {
					setLoading(false);
				}
			},
		);

		return () => {
			unsubscribeAuth();
			if (unsubscribeUserDoc) unsubscribeUserDoc();
			if (unsubscribeSettings) unsubscribeSettings();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, settings, loading, authError }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
