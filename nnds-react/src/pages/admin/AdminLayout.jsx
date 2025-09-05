import AdminSidebar from "../../AdminSidebar";


export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <main style={{ flex: 1, background: "#fff" }}>{children}</main>
    </div>
  );
}
