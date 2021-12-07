import './App.css';
import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./services/auth.service.js";
import * as signalR from "@microsoft/signalr";
// import { b2cPolicies } from './services/polices.service.js';
// import { apiConfig } from './services/polices.service.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

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
          headers: { 'x-ms-client-principal-id': decoded ? decoded.sub : '' }
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

      connection.on('extendedTextMessage', message => {
        const newMessage = JSON.parse(message);
        console.log("message: ", newMessage);
      });
    };
  };

  const [image, setImage] = useState(null)
  const [caption, setCaption] = useState('')
  const [conversation, setConversation] = useState('');

  const handleUploadImage = (e) => {
    let file = e.target.files[0];
    console.log('file: ', file)
    setImage(file)
  }

  const sendMessage = () => {
    // const data = new FormData();
    // console.log(image)
    // data.append('file', image);
    // data.append('chatId', "0b48748b-4d97-473d-b2ea-4fbd734638aa");
    // data.append('caption', 'teste omnipipe');

    axios.post('http://localhost:7071/api/sendExtendedTextMessage', 
      {
        chatId: '0b48748b-4d97-473d-b2ea-4fbd734638aa',
        messageType: 'text',
        conversation: 'teste omnipipe'
      },
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    )
  }

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
                <br />
                <br />
              </div>
              <input onChange={handleUploadImage} type="file" placeholder="Digite a mensagem..." />
              <input onChange={(e) => setConversation(e.target.value)} type="text" placeholder="Digite a mensagem..." />
              <br />

              <button className='button-logout' onClick={() => sendMessage()}>
                SendMessage
              </button>
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
