

import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";

const AdminRoutes = () => {
    const { isAuthenticated, user } = useContext(Context);
    
    // ✅ Check if user exists AND role is "admin"
    if (!isAuthenticated || !user || user.role !== "admin") {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default AdminRoutes;