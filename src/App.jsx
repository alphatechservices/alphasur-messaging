// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './page/welcome';
import CustomerService from './page/customerService';
import MessagingScreen from './page/messageDetails';
import LoginAdmin from './page/loginAdmin';
import Users from './page/users';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login_admin" element={<LoginAdmin />} />
                <Route path="/customer-service" element={<CustomerService />} />
                <Route path="/message" element={<MessagingScreen />} />
                <Route path="/utilisateurs" element={<Users />} />
            </Routes>
        </Router>
    );
};

export default App;
