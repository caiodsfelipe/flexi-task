import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Change this to your desired primary color
    },
    secondary: {
      main: '#f50057', // Change this to your desired secondary color
    },
    background: {
      default: '#f5f5f5', // Change this to your desired background color
    },
  },
  // You can add more customizations here
});

export default theme;
