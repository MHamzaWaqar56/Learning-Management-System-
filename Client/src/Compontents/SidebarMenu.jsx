import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Layout, Menu } from "antd";
import {
  BookOutlined,
  UserOutlined,
  LineChartOutlined,
  DollarOutlined,
  FileAddOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  background: #fff !important;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  .ant-menu-item {
    margin: 4px 0;
    padding-left: 24px !important;
    border-radius: 0;
  }
  .ant-menu-item-selected {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
  }
`;

const SidebarMenu = ({ role = "instructor", defaultSelectedKey = "dashboard" }) => {
  // Common menu items that both roles might share
  const commonItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <NavLink to={`/${role}/dashboard`}>Dashboard</NavLink>,
    },
    {
      key: "create-course",
      icon: <FileAddOutlined />,
      label: <NavLink to={`/${role}/course/create`}>Create Course</NavLink>,
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: <NavLink to={`/${role}/courses`}>Courses</NavLink>,
    }
  ];

  // Role-specific menu items
  const roleSpecificItems = {
    instructor: [
      {
        key: "students",
        icon: <UserOutlined />,
        label: <NavLink to={`/instructor/enrolledusers`}>Students</NavLink>,
      },
      {
        key: "analytics",
        icon: <LineChartOutlined />,
        label: <NavLink to={`/${role}/analysis`}>Analysis</NavLink>,
      },
    ],
    admin: [
      {
        key: "users",
        icon: <TeamOutlined />,
        label: <NavLink to={`/admin/get-users`}>User Management</NavLink>,
      },
      {
        key: "analysis",
        icon: <LineChartOutlined />,
        label: <NavLink to={`/${role}/analysis`}>Analysis</NavLink>,
      }
    ]
  };


  // Combine all menu items
  const menuItems = [
    ...commonItems,
    ...(roleSpecificItems[role] || []),
  ];

  return (
    <StyledSider width={250}>
      <div style={{ padding: "24px 16px", fontSize: "18px", fontWeight: "bold" }}>
        {role === "admin" ? "Admin Dashboard" : "Instructor Dashboard"}
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={[defaultSelectedKey]}
        style={{ borderRight: 0 }}
        items={menuItems}
      />
    </StyledSider>
  );
};

export default SidebarMenu;




