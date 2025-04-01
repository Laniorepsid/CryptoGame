import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'
import globalContext from './../../context/global/globalContext'
import LoadingScreen from '../../components/loading/LoadingScreen'

import socketContext from '../../context/websocket/socketContext'
import { CS_FETCH_LOBBY_INFO } from '../../pokergame/actions'
import './ConnectWallet.scss'

const ConnectWallet = () => {
  const { setWalletAddress, setChipsAmount } = useContext(globalContext)
  const { socket } = useContext(socketContext)
  const navigate = useNavigate()
  const useQuery = () => new URLSearchParams(useLocation().search);
  let query = useQuery()

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          if (!accounts.length) {
            Swal.fire('Error', 'No accounts found. Please unlock MetaMask.', 'error');
            return;
          }
          
          const walletAddress = accounts[0];
          setWalletAddress(walletAddress);
          console.log('Ethereum Wallet Address:', walletAddress);

          if (socket && socket.connected) {
            const gameId = query.get('gameId');
            const username = query.get('username');
            if (gameId && username) {
              socket.emit(CS_FETCH_LOBBY_INFO, { walletAddress, socketId: socket.id, gameId, username });
              console.log(CS_FETCH_LOBBY_INFO, { walletAddress, socketId: socket.id, gameId, username });
              navigate('/play'); 
            }
          }
        })
        .catch((err) => {
          Swal.fire('Error', 'Failed to connect to MetaMask', 'error');
        });

      const handleAccountChange = (accounts) => {
        if (!accounts.length) {
          Swal.fire('Warning', 'MetaMask account disconnected.', 'warning');
          return;
        }
        const walletAddress = accounts[0];
        setWalletAddress(walletAddress);
        console.log('Ethereum Wallet Address changed:', walletAddress);
      };

      window.ethereum.on('accountsChanged', handleAccountChange);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      };
    } else {
      Swal.fire('No Ethereum wallet', 'Please install MetaMask to connect your wallet.', 'info');
    }
  }, [socket]);  

  return (
    <>
      <LoadingScreen />
    </>
  )
}

export default ConnectWallet;
