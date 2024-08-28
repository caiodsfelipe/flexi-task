import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Button from '@mui/material/Button';
import { AuthContext } from '../../contexts/AuthContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <div className="home-container">
            <div className="home-container-center">
                <header className="header">
                    <h1>Welcome to Tempo</h1>
                </header>
                <section className="intro-section">
                    <p>
                        Tempo is your personal scheduling assistant, designed to adapt to your busy life. 
                        Never miss a task again—our app automatically rearranges your schedule to fit your changing priorities.
                    </p>
                </section>
                <section className="cta-section">
                    {isAuthenticated ? (
                        <Button className="primary-button" onClick={() => navigate('/scheduler')}>View Your Schedule</Button>
                    ) : (
                        <>
                            <Button className="primary-button" onClick={() => navigate('/login')}>Login</Button>
                            <Button className="secondary-button" onClick={() => navigate('/register')}>Register</Button>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default HomePage;
