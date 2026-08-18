const url = "https://froth-limes-skid.ngrok-free.dev/api";

// Added 'export' and 'async' to send an actual login request to your backend
export async function login(email, password) {
  try {
    const response = await fetch(`${url}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Returns the backend response (e.g., token or user data)
    return await response.json();
  } catch (error) {
    console.error("Network error during login:", error);
    throw error;
  }
}
