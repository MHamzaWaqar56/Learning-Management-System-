import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";

const AdminAndInstructorRoutes = () => {
    const { isAuthenticated, user } = useContext(Context);
    
    // ✅ Check if user is authenticated AND (role is "admin" OR "instructor")
    if (!isAuthenticated || !user || (user.role !== "admin" && user.role !== "instructor")) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default AdminAndInstructorRoutes;