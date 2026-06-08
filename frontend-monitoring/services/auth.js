import API from "@/services/api";

export async function logout() {
  try {
    await API.post("/logout");
  } catch (error) {
    console.error("Logout API gagal:", error);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("simpro_token");
      localStorage.removeItem("simpro_user");
      window.location.href = "/";
    }
  }
}
