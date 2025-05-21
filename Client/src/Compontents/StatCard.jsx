// components/StatCard.jsx
import { FaUsers, FaBook, FaClock, FaDollarSign } from 'react-icons/fa';
import styled from 'styled-components';

const StatCard = ({ title, value, icon }) => {
  // Select icon based on prop
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <FaUsers className="stat-icon" />;
      case 'book':
        return <FaBook className="stat-icon" />;
      case 'clock':
        return <FaClock className="stat-icon" />;
      case 'dollar':
        return <FaDollarSign className="stat-icon" />;
      default:
        return null;
    }
  };

  return (
    <Wrapper>
    <div className="stat-card">
      <div className="stat-header">
        {getIcon()}
        <h3>{title}</h3>
      </div>
      <div className="stat-value">{value}</div>
    </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`

/* StatCard.css */
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-icon {
  font-size: 24px;
  margin-right: 10px;
  color: #4f46e5; /* Indigo color */
}

.stat-card h3 {
  margin: 0;
  font-size: 16px;
  color: #6b7280; /* Gray 500 */
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937; /* Gray 800 */
}

/* For the grid layout in AdminDashboard */
.admin-dashboard .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 30px;
}


`

export default StatCard;