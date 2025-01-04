// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './page/welcome';
import CustomerService from './page/customerService';
import MessagingScreen from './page/messageDetails';
import LoginAdmin from './page/loginAdmin';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login_admin" element={<LoginAdmin />} />
                <Route path="/customer-service" element={<CustomerService />} />
                <Route path="/message" element={<MessagingScreen />} />
            </Routes>
        </Router>
    );
};

export default App;
