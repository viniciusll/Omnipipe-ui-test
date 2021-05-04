import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { MsalProvider } from "@azure/msal-react";
import App from './App';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./services/auth.service";

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
