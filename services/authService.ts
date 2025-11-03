
// WARNING: This is a mock authentication service for demonstration purposes only.
// Do NOT use this in a production environment.
// Authentication should always be handled on a secure backend server.

const LOGGED_IN_KEY = 'isLoggedIn';
const PASSWORD = 'admin123'; // Hardcoded password for demo

export const authService = {
    login(password: string): boolean {
        if (password === PASSWORD) {
            try {
                localStorage.setItem(LOGGED_IN_KEY, 'true');
                return true;
            } catch (error) {
                console.error("Could not set item in localStorage", error);
                // Still return true to allow login in environments where localStorage is blocked (e.g., some sandboxes)
                return true;
            }
        }
        return false;
    },

    logout(): void {
        try {
            localStorage.removeItem(LOGGED_IN_KEY);
        } catch (error) {
            console.error("Could not remove item from localStorage", error);
        }
    },

    isLoggedIn(): boolean {
        try {
            return localStorage.getItem(LOGGED_IN_KEY) === 'true';
        } catch (error) {
            console.error("Could not read item from localStorage", error);
            return false;
        }
    },
};
