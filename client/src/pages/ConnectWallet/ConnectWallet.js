import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'
import { ethers } from 'ethers'; // إضافة الاستيراد هنا
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", [])
        .then((accounts) => {
          const walletAddress = accounts[0];
          setWalletAddress(walletAddress);

          if (socket !== null && socket.connected === true) {
            const gameId = query.get('gameId');
            const username = query.get('username');
            if (gameId && username) {
              socket.emit(CS_FETCH_LOBBY_INFO, { walletAddress, socketId: socket.id, gameId, username });
              navigate('/play');
            }
          }
        })
        .catch((err) => {
          Swal.fire("Error", "Please install MetaMask or connect to Ethereum wallet", "error");
        });
    } else {
      Swal.fire("Error", "MetaMask not detected", "error");
    }
  }, [socket]);

  return (
    <>
      <LoadingScreen />
    </>
  )
}

export default ConnectWallet
