import {
    Link
  } from "react-router-dom";
  import '../App.css';

  import { useEffect, useState } from 'react';
  
  const Header = () => {
  
  const [walletAddress, setWalletAddress] = useState("");
  
    useEffect(() => {
      getCurrentWalletConnected();
      addWalletListener();
    }, [walletAddress]);


    // This function is used to connect the user's wallet to the DApp
    const connectWallet = async () => {
       // Check if the window object and ethereum object exist
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        
        try {
          //take out the array of connected accounts
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          // Set the wallet address state to the connected account
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } catch (err) {
          console.error(err.message);
        }
      } else {
        // If MetaMask is not installed, inform the user to install it
        console.log("Please install MetaMask");
      }
    };
  
    // This function gets the current wallet connected to the DApp
    const getCurrentWalletConnected = async () => {
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        try {
           // Get the list of accounts currently connected to MetaMask
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          // If an account is connected, set the wallet address state to the connected account
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            console.log(accounts[0]);
          } else {
            console.log("Connect to MetaMask using the Connect button");
          }
        } catch (err) {
          console.error(err.message);
        }
      } else {
        // If MetaMask is not installed, inform the user to install it
        console.log("Please install MetaMask");
      }
    };
  
    // This function listens for changes in the connected wallet address
    const addWalletListener = async () => {
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        window.ethereum.on("accountsChanged", (accounts) => {
           // When the connected wallet address changes, set the wallet address state to the new connected account
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        });
      } else {
        // If MetaMask is not installed, set the wallet address state to an empty string and inform the user to install it
        setWalletAddress("");
        console.log("Please install MetaMask");
      }
    };
  
  
  
      return (
          <div style={{width:"100%",backgroundColor: "red !important"}}>
                  <div class="float-left nb" style={{height:"100px",width:"30%"}}>
                  <Link to="/"><h1 style={{color:"orange"}}>Celebrity Signatures</h1></Link>
                  </div>
                  <div class="float-left nb" style={{marginLeft:"-1px", height:"100px",width:"50%"}}>
               
                    <ul>
                    <li><Link class="linkCol" to="/Upload"><h3>UploadNFT</h3></Link></li>
                    <li><Link class="linkCol" to="/MyNFT"><h3>MyNFT</h3></Link></li>
                    <li><Link class="linkCol" to="/MyProfile"><h3>Profile</h3></Link></li>
                    
                    </ul>
                 
                  </div>
                  <div class="float-left nb" style={{height:"100px",width:"20%"}}>
                    <div style={{marginTop:"38px",marginLeft:"10%"}}><button style={{backgroundColor:"Red",height:"30px",textAlign:"center",fontWeight:"bold"}} onClick={connectWallet}>
                        {walletAddress && walletAddress.length > 0
                        ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
                        : "Connect Wallet"}
                    </button></div>

                  </div>
              </div>
      );
    }
  
export default Header;