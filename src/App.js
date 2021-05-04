import './App.css';
import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./services/auth.service.js";
import * as signalR from "@microsoft/signalr";
// import { b2cPolicies } from './services/polices.service.js';
// import { apiConfig } from './services/polices.service.js';

function App() {
  const { instance } = useMsal();
  const [accountId, setAccountId] = useState('');
  const [chats, setChats] = useState([]);
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);

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

  useEffect(() => {
    if (connection == null) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:7071/api')
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

  useEffect(() => {
    onClose();
    connecting();
  }, [connection]);

  const eventChats = () => {
    if (connection !== null) {
      connection.on('chatUpdate', res => {
        const newChat = JSON.parse(res)
        console.log('newChat: ', newChat);
        const _chats = chats.map(c => {
          if (newChat.id === c.id) {
            console.log('c.id: ', c.id);
            return c;
          };
          return c;
        });
        console.log('_chats: ', _chats);
        const newChats = [
          ..._chats,
          newChat
        ];
        console.log('newChats: ', newChats);
        setChats(newChats);
      });
    } else {
      console.log('você não está conectado');
    }
  };

  useEffect(() => {
    eventChats();
  });

  const newMessage = async () => {
    if (connection !== null) {
      await connection.on('newMessage', res => {
        const receivedMessage = JSON.parse(res);
        const _messages = chats.map(c => {
            if (c.id === receivedMessage.chatId) {
              return receivedMessage;
            };
          });
        setMessages(_messages);
      });
    };
  };

  useEffect(() => {
    newMessage();
  });

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
              <div className='chats'>
                {
                  chats.length !== 0 ? chats.map(chat => (
                    <div key={chat.id} className='chat'>
                      <img src='https://static.remove.bg/remove-bg-web/2a274ebbb5879d870a69caae33d94388a88e0e35/assets/start-0e837dcc57769db2306d8d659f53555feb500b3c5d456879b9c843d1872e7baa.jpg' className='imageProfile' alt='imagem do perfil' />
                      <div className='chatlistItem-lines'>
                        <div className='nameContact'>
                          {chat.Contact.name === null ? chat.Contact.jid : chat.Contact.name}
                        </div>
                        <div className='lastMessage'>
                          {
                            messages ? messages.map(message => (
                              <p key={`${message.id}_${message.chatId}`}>
                                { message.chatId === chat.id ? message.messages[0].conversation : ''}
                              </p>
                            )) : ''
                          }
                        </div>
                      </div>
                    </div>
                  )) : 'Vc n tem chats'
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
