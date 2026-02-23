import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  console.log(user);
  if (!isAuthenticated) {
    navigate("/auth/signin");
  }
  const logout = useAuthStore((s) => s.logout);
  return (
    <>
      <div>
        <button onClick={logout}>Logout</button>
      </div>
    </>
  );
};
export default HomePage;
