import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './HomePage.css';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/scheduler');
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;
        document.body.appendChild(script);

        const handleMessage = (event) => {
            console.log('Received message:', event.data);
            if (event.data.type === 'stripe-buy-button:success') {
                const { sessionId } = event.data;
                console.log('Redirecting with session ID:', sessionId);
                navigate(`/register?session_id=${sessionId}`);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            document.body.removeChild(script);
            window.removeEventListener('message', handleMessage);
        };
    }, [navigate, isAuthenticated]);

    return (
        <div className="home-container">
            <Container maxWidth="md" className="content-wrapper">
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Welcome to Tempo
                    </Typography>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Your Personal Scheduling Assistant
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Tempo is designed to adapt to your busy life. Never miss a task again—our app automatically rearranges your schedule to fit your changing priorities.
                    </Typography>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Subscribe to Get Started
                        </Typography>
                        <stripe-buy-button
                            buy-button-id="buy_btn_1PsspwBAIWiwRgzWmZbQlZzf"
                            publishable-key="pk_test_xALdQa86qg5mkwxVhIppiotu00c4JLTRY3"
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button
                                component={Link}
                                to="/login"
                                variant="outlined"
                                color="primary"
                            >
                                Already have an account? Log in
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </div>
    );
}

export default HomePage;
