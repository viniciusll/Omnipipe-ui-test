import './App.css';
import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./services/auth.service.js";
import * as signalR from "@microsoft/signalr";
// import { b2cPolicies } from './services/polices.service.js';
// import { apiConfig } from './services/polices.service.js';
import jwt from 'jsonwebtoken';

function App() {
  const { instance } = useMsal();
  const [accountId, setAccountId] = useState('');
  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState(null);

  function selectAccount() {
    const currentAccounts = instance.getAllAccounts();

    if (currentAccounts.length === 0) {
      return;
    } else if (currentAccounts.length > 1) {
      // Add your account choosing logic here
      console.log("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
      setAccountId(currentAccounts[0].homeAccountId);
    }
  };

  function handleResponse(response) {
    if (response !== null) {
      console.log('response: ', response);
      localStorage.setItem('accessToken', response.accessToken);
      setAccountId(response.account.homeAccountId);
    } else {
      selectAccount();
    }
  };

  const handleLogin = () => {
    instance.loginPopup(loginRequest)
      .then(handleResponse)
  };

  const handleLogout = () => {
    const logoutRequest = {
      account: instance.getAccountByHomeId(accountId)
    };

    localStorage.removeItem('accessToken');

    instance.logout(logoutRequest);
  };

  useEffect(() => {
    selectAccount();
  });
  const token = localStorage.getItem('accessToken');
  const decoded = jwt.decode(localStorage.getItem('accessToken'));
  console.log('decoded: ', decoded);

  useEffect(() => {
    if (connection == null) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('https://omnipipe-functions.express.dev.br/api', {
          accessTokenFactory: () => token,
          headers: {'x-ms-client-principal-id': decoded ? decoded.sub : '' }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      setConnection(connection);
    };
  }, []);

  const connecting = async () => {
    if (connection == null) {
      console.log('carregando...');
    } else {
      console.log('connecting...');
      await connection.start()
        .then(() => setReady(true))
        .catch(e => console.log('Connection failed: ', e));
    }
  };

  const onClose = async () => {
    if (connection == null) {
      console.log('carregando...');
    } else {
      await connection.onclose(() => console.log('disconnected'));
    }
  };

  const eventMessages = () => {
    if (connection !== null) {
      connection.on('newMessage', message => {
        const newMessage = JSON.parse(message);
        console.log("message: ", newMessage);
      });
    };
  };

  useEffect(() => {
    onClose();
    connecting();
    eventMessages();
  }, [connection]);


  return (
    <div className="App">
      <header className="App-header">
        {
          accountId !== undefined && accountId !== null && accountId !== '' ?
            <>
              <div className='cabecalho'>
                <h1 className="title">Mensagens</h1>
                <button className='button-logout' onClick={() => handleLogout()}>
                  Sair
                </button>
              </div>
              <div className='messages'>
                {
                  messages.length !== 0 ? messages.map(message => (
                    <div key={message.id} className='chat'>
                      <img src='https://static.remove.bg/remove-bg-web/2a274ebbb5879d870a69caae33d94388a88e0e35/assets/start-0e837dcc57769db2306d8d659f53555feb500b3c5d456879b9c843d1872e7baa.jpg' className='imageProfile' alt='imagem do perfil' />
                      <div className='chatlistItem-lines'>
                        <div className='nameContact'>
                          {message.Contact.name === null ? message.Contact.jid : message.Contact.name}
                        </div>
                        <div className='lastMessage'>
                          <p>
                            {message ? message.messages[0].conversation : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) : <p>Vc n tem messages</p>
                }
              </div>
            </> :
            <>
              <h1 className="title">
                Usuário não está logado
              </h1>
              <button className='button' onClick={() => handleLogin()}>
                Logar
              </button>
            </>
        }
      </header>
    </div>
  );
}

export default App;
