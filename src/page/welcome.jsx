import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/Alphasur.png';
import '../welcome.css';

function Welcome() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  const goToPage = (path) => {
    navigate(path);
  };

  const handleMouseEnter = (button) => {
    setIsHovered(true);
    setHoveredButton(button);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredButton(null);
  };

  return (
    <div className="welcomeContainer">
      <h1 className="welcomeText">BIENVENUE CHEZ ALPHA TECH</h1>
      <img src={logo} alt="logo AlphaSur" className="logo" />
      <div className="buttonContainer">
        <button
          onClick={() => goToPage('/login_admin')}
          className={`welcomeButton ${isHovered && hoveredButton === 'login_admin' ? 'loginButtonHover' : ''}`}
          onMouseEnter={() => handleMouseEnter('login_admin')}
          onMouseLeave={handleMouseLeave}
        >
          <div className="buttonIcon">🔑</div> Aller à la page admin
        </button>
      </div>
    </div>
  );
}

export default Welcome;