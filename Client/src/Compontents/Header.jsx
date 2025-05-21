import logo from "../assets/Images/logoimage.png"
import React from "react";
import { NavLink, Link, Navigate } from "react-router-dom";
import { SiGoogletagmanager } from "react-icons/si";
import { useContext } from "react";
import { Context } from "../main";
import toast from "react-hot-toast";
import styled from "styled-components";
import axios from 'axios';

const StyledNavbar = styled.nav`
  background: #2d3748;
  padding: 0.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.25rem;
  color: #f7fafc;
  text-decoration: none;
  
  svg {
    margin-right: 0.5rem;
    font-size: 1.5rem;
    color: #facc15;
  }

  img{
   width : 20%;
  }

`;

const NavItem = styled.li`
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
`;

const NavLinkStyled = styled(NavLink)`
  color: #cbd5e0;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  text-decoration: none;
  
  &:hover {
    color: #ffffff;
    background: #4a5568;
  }
  
  &.active {
    color: #4299e1;
  }
`;

const DropdownToggle = styled(NavLink)`
  color: #cbd5e0 !important;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  text-decoration: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    color: #ffffff !important;
    background: #4a5568;
  }
  
  &::after {
    margin-left: 0.5rem;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 0.25rem;
  min-width: 200px;
  z-index: 1000;
  display: none;
  
  &.show {
    display: block;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownItem = styled(Link)`
  color: #cbd5e0;
  padding: 0.75rem 1rem;
  display: block;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    color: white;
    background: #4a5568;
  }
`;

const AuthLink = styled(NavLink)`
  color: #cbd5e0;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  text-decoration: none;
  
  &:hover {
    color: white;
    background: #4a5568;
  }
`;


const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #cbd5e0;
  padding: 0.75rem 1rem;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  
  &:hover {
    color: white;
    background: #4a5568;
  }
`;

const Header = () => {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const logout = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  return (
    <StyledNavbar className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Brand to="/">
          {/*<SiGoogletagmanager /> */}
          <img src={logo} alt="Logo" />
          FineTech
        </Brand>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <NavItem>
              <NavLinkStyled to="/">HOME</NavLinkStyled>
            </NavItem>

            <NavItem>
              <NavLinkStyled to="/about">ABOUT</NavLinkStyled>
            </NavItem>

            <NavItem>
              <NavLinkStyled to="/user/courses">COURSES</NavLinkStyled>
            </NavItem>

            {/* Authentication Links */}
            {!user ? (
              <>
                <NavItem>
                  <AuthLink to="/auth">LOGIN</AuthLink>
                </NavItem>
                <NavItem>
                  <AuthLink to="/auth">REGISTER</AuthLink>
                </NavItem>
              </>
            ) : (
              <>
                {/* User Dropdown */}
                <NavItem>
                  <DropdownContainer>
                    <DropdownToggle 
                      onClick={toggleDropdown}
                      className="nav-link dropdown-toggle"
                    >
                      {user.name}
                    </DropdownToggle>
                    <DropdownMenu className={dropdownOpen ? "show" : ""}>
                      {/* Profile Links */}
                      <DropdownItem 
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </DropdownItem>
                      
                      <DropdownItem 
                        to="/profile/update"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Update Profile
                      </DropdownItem>

                      {/* Show dashboard only for admin/instructor */}
                      {(user.role === "admin" || user.role === "instructor") && (
                        <DropdownItem 
                          to={`/${user.role}/dashboard`}
                          onClick={() => setDropdownOpen(false)}
                        >
                          DASHBOARD
                        </DropdownItem>
                      )}
                      
                      <LogoutButton onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}>
                        LOGOUT
                      </LogoutButton>
                    </DropdownMenu>
                  </DropdownContainer>
                </NavItem>
              </>
            )}
          </ul>
        </div>
      </div>
    </StyledNavbar>
  );
};

export default Header;



