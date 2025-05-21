import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";

const InstructorRoutes = () => {
    const { isAuthenticated, user } = useContext(Context);
    
    // Check if user exists AND role is "instructor"
    if (!isAuthenticated || !user || user.role !== "instructor") {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default InstructorRoutes;