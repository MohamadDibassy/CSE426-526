import CelebritySignature from '../contracts/CelebritySignature.json';
import { useState,useEffect } from "react";
import {ethers} from 'ethers';
import Web3 from "web3"; 
function Cards(data) {
  
  const[activeUser,updateActiveUser]=useState("");
  const [state, setState] = useState({
    web3: null,
    contract: null
  });

 
  // The useEffect hook is used to run after the component has rendered.
// In this case, it is used to connect to the local blockchain network using web3.
  useEffect(() => {
    // A provider is created to connect to the local blockchain network at address "HTTP://127.0.0.1:7545"
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

     // An asynchronous function is defined to connect to the smart contract deployed on the local network
    async function ConnectingToSC() {
      const web3 = new Web3(window.ethereum);
       // The network ID of the connected network is retrieved
      const networkId = await web3.eth.net.getId();
      //The deployed contract network details are obtained using the network ID
      const deployedNetwork = CelebritySignature.networks[networkId];
      // A new instance of the smart contract is created, using the web3 instance and the contract ABI and address
      const contract = new web3.eth.Contract(
        CelebritySignature.abi,
        deployedNetwork.address
      );
      console.log(deployedNetwork.address);
      setState({ web3: web3, contract: contract });
    }
    // The ConnectingToSC function is called if a provider exists, when the component mounts
    provider && ConnectingToSC();
  }, []);

  useEffect(()=>{
    getCurrentWalletConnected();
  },[activeUser])

  const getCurrentWalletConnected = async () => {
    

    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          updateActiveUser(accounts[0].toString());
          console.log("just after assigning",activeUser);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      
      console.log("Please install MetaMask");
    }
  };

  // const handleClick = (event) => {
  //   const value = event.target.dataset.value;
  //   updateId(value); 
  // };

  // useEffect(() => {
  //   console.log(Id);
  // }, [Id]);

  //interacting with the smart contract buyItem() function. Giving the token ID from the dataset.value of the button "buy item"
  const buyNFT = async (event) => {
    const {contract} = state;
    let Id = event.target.dataset.value;
    let numericId= Number(Id);
    console.log(Id);
    let buyingPrice = await contract.methods.getPriceOfanyNFT(numericId).call();
    console.log(buyingPrice)
    buyingPrice=buyingPrice/10**18;
    buyingPrice=buyingPrice.toString();
    buyingPrice=ethers.utils.parseEther(buyingPrice).toString()
    console.log(buyingPrice);
    const gasEstimate = await contract.methods.buyItem(numericId).estimateGas({ from: activeUser, to: contract.options.address, value: buyingPrice });
    let transaction = await contract.methods.buyItem(numericId).send({ from: activeUser, to: contract.options.address, value: buyingPrice, gas: gasEstimate});
    alert('You successfully bought the NFT!');
  };
  return (

  
    <div style={{border:"solid",borderWidth:"2px",borderColor:"Black",height:"500px",width:"358px",backgroundColor: "#f2f2f2",
                        borderRadius: "10px",padding: "10px"}}>
      <img crossorigin="anonymous" src={data.data.image} style={{height:"250px",width:"100%",objectFit: "cover",borderRadius: "5px"}} />
        <h2 style={{color:"black"}}>{data.data.name}</h2>
          <p  style={{color:"black"}}>{data.data.description}</p>
          <p>Seller: {data.data.seller}</p>
          <h3  style={{color:"black"}}>{data.data.price} Ether</h3>
          <button data-value={data.data.tokenId} onClick={buyNFT} style={{backgroundColor:"LightBlue",borderRadius:"5px",width:"200px",height:"30px",fontWeight:"Bold"}}>Buy ITEM</button>
    </div>
    
  );
}

export default Cards;