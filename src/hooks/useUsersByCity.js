import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useSentinelaData } from "../utils/SentinelaDataContext";

export function useUsersByCity() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const { user } = useSentinelaData();
	const cityId = user?.cityId;

	useEffect(() => {
		if (!cityId) {
			setUsers([]);
			setLoading(false);
			return;
		}

		setLoading(true);

		const q = query(
			collection(db, "users"),
			where("cityId", "==", cityId),
			where("isAdmin", "==", false),
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setUsers(data);
				setLoading(false);
			},
			(err) => {
				console.error(err);
				setError(err);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, [cityId]);

	return { users, loading, error };
}
