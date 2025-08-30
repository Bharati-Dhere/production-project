import React, { createContext, useContext, useState, useEffect } from "react";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	// On mount, hydrate user from backend if token exists
	useEffect(() => {
		async function hydrateUser() {
			try {
				const res = await fetch("https://production-project-1.onrender.com/api/auth/me", { credentials: "include" });
				if (res.ok) {
					const data = await res.json();
					if (data && data.user) {
						setUser(data.user);
					}
				}
			} catch {}
		}
		hydrateUser();
	}, []);

	// No localStorage usage for user/session



const login = async ({ email, password, role }) => {
	try {
		const res = await fetch('https://production-project-1.onrender.com/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ email, password, role })
		});
		if (res.ok) {
			const data = await res.json();
			if (data && data.user) {
				setUser(data.user);
				return { success: true, user: data.user };
			}
		} else {
			const err = await res.json();
			return { success: false, message: err.message || 'Login failed' };
		}
	} catch (e) {
		return { success: false, message: 'Network error' };
	}
};

	const logout = async () => {
		setUser(null);
		try {
			await fetch("https://production-project-1.onrender.com/api/auth/logout", { method: "POST", credentials: "include" });
		} catch {}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
