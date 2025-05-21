

// import { createContext, StrictMode, useState } from "react";
// import { createRoot } from "react-dom/client";
// import App from "./App.jsx";
// import { BrowserRouter } from "react-router-dom";
// import './index.css';
// import './App.css';
// import { CertificateProvider } from "./APIs/Context/CertificateContext.jsx";

// export const Context = createContext({
//     isAuthenticated: false,
//     setIsAuthenticated: () => {},
//     user: null,
//     setUser: () => {},
// });

// const AppWrapper = () => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Default: false
//     const [user, setUser] = useState(null); // ✅ Default: null

//     return (
//         <CertificateProvider>
//         <Context.Provider 
//             value={{ 
//                 isAuthenticated, 
//                 setIsAuthenticated, 
//                 user, 
//                 setUser }}>
//             <App />
//         </Context.Provider>
//         </CertificateProvider>
//     );
// };

// createRoot(document.getElementById("root")).render(
//        <StrictMode>
//         <BrowserRouter>
//             <AppWrapper />
//         </BrowserRouter>
//         </StrictMode>
// );



///////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////





// import { createContext, StrictMode, useState, useEffect } from "react";
// import { createRoot } from "react-dom/client";
// import App from "./App.jsx";
// import { BrowserRouter } from "react-router-dom";
// import './index.css';
// import './App.css';
// import { CertificateProvider } from "./APIs/Context/CertificateContext.jsx";
// import Cookies from "js-cookie";

// // Creating Context
// export const Context = createContext({
//     isAuthenticated: false,
//     setIsAuthenticated: () => {},
//     user: null,
//     setUser: () => {},
// });

// // AppWrapper with Cookies Integration
// const AppWrapper = () => {
//     // Get initial values from cookies
//     const [isAuthenticated, setIsAuthenticated] = useState(() => {
//         return Cookies.get("isAuthenticated") === "true";  // Default to false if not found
//     });
    
//     const [user, setUser] = useState(() => {
//         const userCookie = Cookies.get("user");
//         return userCookie ? JSON.parse(userCookie) : null;  // Default to null if not found
//     });

//     // Update cookies when authentication state changes
//     const handleAuthChange = (value) => {
//         setIsAuthenticated(value);
//         Cookies.set("isAuthenticated", value.toString(), { expires: 7 });  // 7 days expiry
//     };

//     // Update cookies when user state changes
//     const handleUserChange = (value) => {
//         setUser(value);
//         Cookies.set("user", JSON.stringify(value), { expires: 7 });  // 7 days expiry
//     };

//     return (
//         <CertificateProvider>
//             <Context.Provider
//                 value={{
//                     isAuthenticated,
//                     setIsAuthenticated: handleAuthChange,
//                     user,
//                     setUser: handleUserChange,
//                 }}
//             >
//                 <App />
//             </Context.Provider>
//         </CertificateProvider>
//     );
// };

// createRoot(document.getElementById("root")).render(
//     <StrictMode>
//         <BrowserRouter>
//             <AppWrapper />
//         </BrowserRouter>
//     </StrictMode>
// );




//////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////




import { createContext, StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import './index.css';
import './App.css';
import Cookies from "js-cookie";
import { CertificateProvider } from "./APIs/Context/CertificateContext";

// Context creation
export const Context = createContext({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    user: null,
    setUser: () => {}
});

const AppWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        Cookies.get("isAuthenticated") === "true"
    );
    const [user, setUser] = useState(() => {
        const userCookie = Cookies.get("user");
        return userCookie ? JSON.parse(userCookie) : null;
    });

    // When cookies are updated, update Context as well
    const handleAuthChange = (value) => {
        setIsAuthenticated(value);
        Cookies.set("isAuthenticated", value.toString(), { expires: 7 }); // 7 days expiry
    };

    const handleUserChange = (value) => {
        setUser(value);
        Cookies.set("user", JSON.stringify(value), { expires: 7 });
    };

    useEffect(() => {
        // Optionally, you can handle some logic on load, like re-validating the user status.
        // For now, it's directly using cookies.
    }, []);

    return (
        <CertificateProvider>
            <Context.Provider
                value={{
                    isAuthenticated,
                    setIsAuthenticated: handleAuthChange,
                    user,
                    setUser: handleUserChange
                }}
            >
                <App />
            </Context.Provider>
        </CertificateProvider>
    );
};

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AppWrapper />
        </BrowserRouter>
    </StrictMode>
);
