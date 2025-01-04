// src/Login.js
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const LoginAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Vérification de l'adresse e-mail
            if (email.endsWith('@alphatech.com')) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/customer-service'); // Redirige vers /customer-service
            } else {
                // Si l'e-mail ne termine pas par @alphatech.com, afficher un message d'erreur
                alert("Erreur de l'authentification")           }
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion. Veuillez vérifier vos informations.");
        }
    };

    return (
        <div className='bodyLogin'>
            <div className='login-content'>
                <div className='login-form'>
                    <h2 className='loginText'>CONNEXION</h2>
                    <form onSubmit={handleLogin} className='login-container'>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='loginInput'
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='loginInput'
                        />
                        <button type="submit" className='loginButton'>Se connecter</button>
                    </form>
                </div>
                <div className='login-image'>
                    <img src="https://i.ibb.co/7Y94vd2/service.jpg" alt="Service" />
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;
