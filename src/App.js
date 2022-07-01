import React, { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/Revecoin.json";
import './App.css';
import video from './images/background.gif';
import logo from './images/logo.png';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [tokenContract, setTokenContract] = useState(null);
  const [inputValue, setInputValue] = useState({ walletAddress:"", transferAmount:"", burnAmount:"", mintAmount:""})
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [accountWalletAddress, setAccountWalletAddress] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = "0x6d6B4CFBce429a63810a62007520a66e519d6662";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async() => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setIsWalletConnected(true);
        setAccountWalletAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to get our token.");
        console.log("No MetaMask detected.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getContract = async() => {
    try {
      if (window.ethereum) {
        var provider = new ethers.providers.Web3Provider(window.ethereum);
        var signer = provider.getSigner();
        var revecoin = new ethers.Contract(contractAddress, contractABI, signer);
        setTokenContract(revecoin);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getTokenInfo = async() => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      let tokenName = await tokenContract.name();
      let tokenSymbol = await tokenContract.symbol();
      let tokenOwner = await tokenContract.owner();
      let tokenSupply = await tokenContract.totalSupply();
      tokenSupply = utils.formatEther(tokenSupply);

      setTokenName(tokenName);
      setTokenSymbol(tokenSymbol);
      setTokenOwnerAddress(tokenOwner);
      setTokenTotalSupply(tokenSupply);

      if(account.toLowerCase() === tokenOwner.toLowerCase()) {
        setIsTokenOwner(true);
      } 
    } catch (error) {
      console.log(error)
    }
  }

  const transferToken = async(event) => {
    event.preventDefault();
    try {
      const txn = await tokenContract.transfer(inputValue.walletAddress, utils.parseEther(inputValue.transferAmount));
      setStatus("Transferring tokens...");
      await txn.wait();
      setStatus("Tokens transfered: ", txn.hash);
    } catch (error) {
      console.log(error);
    }
  }

  const burnTokens = async(event) => {
    event.preventDefault();
    try {
      const txn = await tokenContract.burn(utils.parseEther(inputValue.burnAmount));
      setStatus("Burning tokens...");
      await txn.wait();
      setStatus("Tokens burned!", txn.hash);

      let tokenSupply = await tokenContract.totalSupply();
      tokenSupply = utils.formatEther(tokenSupply);
      setTokenTotalSupply(tokenSupply);
    } catch (error) {
      console.log(error);
    }
  }

  const mintTokens = async(event) => {
    event.preventDefault();
    try {
      let tokenOwner = await tokenContract.owner();
      const txn = await tokenContract.mint(tokenOwner, utils.parseEther(inputValue.mintAmount));
      setStatus("Minting token...");
      await txn.wait();
      setStatus("Tokens minted!", txn.hash);

      let tokenSupply = await tokenContract.totalSupply();
      tokenSupply = utils.formatEther(tokenSupply);
      setTokenTotalSupply(tokenSupply);
    } catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getContract();
    getTokenInfo();
  }, [])

  return (
    <main className="main-container">
      <div className="video-bg-container">
        <img className="background-video" src={video} type="gif" />
      </div>
      <div className="main-section">
        <div className="left-container">
          <div className='logo-container'>
            <img className='logo-img' src={logo}/>
            <h2 className='logo-txt'>ReveCoin</h2>
          </div>
          <h1 className='hero-heading'>Happiness!</h1>
          <p>It's so tasty.<br />Come and chase me.</p>
          <p className='hero-desc'>- Red Velvet</p>
          <p><strong>Token Owner Address: </strong>{tokenOwnerAddress}</p>
          <p><strong>Token Contract Address: </strong>{contractAddress}</p>
          <button className="connect-button" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
        <div className="right-container">
          <div className="customer-section">
            <div className="stats-container">
              <span><strong>Coin: </strong>{tokenName}  </span>
              <span><strong>Symbol: </strong>{tokenSymbol}  </span>
              <span><strong>Total Supply: </strong>{tokenTotalSupply}  </span>
              {isWalletConnected && <p><strong>Your Wallet Address: </strong>{accountWalletAddress}</p>}
            </div>
            <div className='inputs-container'>
              {error && <p style={{color:"red"}}>{error}</p>}
              {status && <p style={{color:"green"}}>{status}</p>}
              <form>
              <div className='input-container'>
                <input 
                  type="text"
                  className="main-input"
                  onChange={handleInputChange}
                  name="walletAddress"
                  placeholder="Wallet Address"
                  value={inputValue.walletAddress}
                />
                <input 
                  type="text"
                  className="main-input"
                  onChange={handleInputChange}
                  name="transferAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.walletAddress}
                />
                <button
                  className="main-button"
                  onClick={transferToken}>TRANSFER TOKEN</button>
              </div>
              </form>
            </div>
            { isTokenOwner && (
              <div className='inputs-container'>
                <form>
                <div className='input-container'>
                  <input 
                    type="text"
                    className="main-input"
                    onChange={handleInputChange}
                    name="burnAmount"
                    placeholder={`0.0000 ${tokenSymbol}`}
                    value={inputValue.burnAmount}
                  />
                  <button
                    className="main-button"
                    onClick={burnTokens}>BURN TOKENS</button>
                </div>
                </form>
                <form>
                <div className='input-container'>
                  <input 
                    type="text"
                    className="main-input"
                    onChange={handleInputChange}
                    name="mintAmount"
                    placeholder={`0.0000 ${tokenSymbol}`}
                    value={inputValue.mintAmount}
                  />
                  <button
                    className="main-button"
                    onClick={mintTokens}>MINT TOKENS</button>
                </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
