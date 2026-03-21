import { logout } from "../../(auth)/actions";

export default function Dashboard() {
  return (
    <div>
      <div className="flex-center">
        <h1>Dashboard</h1>
      </div>
      <div className="flex-center">
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
