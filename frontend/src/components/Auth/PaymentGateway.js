import React from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const PaymentGateway = () => {
  const { user, setUser } = useAuth();

  const handlePayment = async () => {
    try {
      const response = await axios.post('/api/auth/confirm-payment', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.paymentStatus === 'paid') {
        setUser({ ...user, paymentStatus: 'paid' });
      }
    } catch (error) {
      //
    }
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: '60px', // Adjust based on your top bar height
      left: 0,
      right: 0,
      bottom: '60px', // Adjust based on your bottom bar height
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px',
      overflowY: 'auto', // Allow scrolling if content overflows
    }}>
      <Box sx={{
        maxWidth: '100%',
        width: '400px', // Adjust as needed
      }}>
        <Typography variant="h4" gutterBottom>
          Almost there!
        </Typography>
        <Typography variant="body1" paragraph>
          To access all features, please complete your payment.
        </Typography>
        <stripe-buy-button
          buy-button-id="buy_btn_1PtZ3SBAIWiwRgzW4qlWbAOf"
          publishable-key="pk_test_xALdQa86qg5mkwxVhIppiotu00c4JLTRY3"
          onClick={handlePayment}
        >
        </stripe-buy-button>
      </Box>
    </Box>
  );
};

export default PaymentGateway;
