
import Header from './Header';
import CelebritySignature from "../contracts/CelebritySignature.json";
import Web3 from "web3";
import { useState,useEffect } from "react";


function MyProfile() {

    const [state, setState] = useState({
        web3: null,
        contract: null,
      });
      const[activeUser,updateActiveUser]=useState("");
     const [balance,updateBalance]=useState("");
     const [flag,updateFlag]=useState(false);
      const [price,setPrice]=useState("");
      const [priceToList,setPriceToList]=useState("");
     
  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

    async function ConnectingToSC() {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CelebritySignature.networks[networkId];
      const contract = new web3.eth.Contract(
        CelebritySignature.abi,
        deployedNetwork.address
      );
      console.log(deployedNetwork.address);
      setState({ web3: web3, contract: contract });
    }
    provider && ConnectingToSC();
  }, []);

  useEffect(()=>{
    getCurrentWalletConnected();
    getOwner();
  },[activeUser,flag]);

 

  const getCurrentWalletConnected = async () => {
    

    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const web3=new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          updateActiveUser(accounts[0].toString());
          let balance = await web3.eth.getBalance(accounts[0])/10**18;
          
          console.log(balance)
          updateBalance(balance);

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

  //getting owner of the smart contract and chekcking if the sender is the owner of the SC or not
  // IF he is the owner, then 2 more functions will be there for him on this page - 1.WithdrawFunds(), 2.UpdatePriceTOList()
  async function getOwner(){
    console.log("fdfdafdafdafdsfdsgsdgssrgsgs");
    const {contract}=state;
    let owner=await contract.methods.OwnerOfSC().call();
    console.log("owner of sc",owner);
    console.log(typeof owner);
    console.log(typeof activeUser)
    console.log("i am here",owner)
    console.log("active",activeUser)
    
    if(owner.trim().toLowerCase() === activeUser.trim().toLowerCase()){
      console.log("its true boysss");
      updateFlag(true);
    }
  }

  //this function was intended to add the ERC 721 nft inside our metamask wallet but my wallet says that
  // it didnt support ERC721, it only supports ERC20
  const addToken = async () => {
    const {contract}=state;
    const tokenSymbol = 'CELEBSIGNTOKEN'; // Replace with your token symbol
    const tokenDecimals = 18; // Replace with your token decimals
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: contract.options.address,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  async function WithDraw(){
    const {contract}=state;
    let transaction = await contract.methods.withdrawFunds().send({from: activeUser});
    alert("Funds got successfully transferred");
    console.log(transaction);
  }

  const updatePriceToList = async()=>{
    const {contract}= state;
    let numericPtl= Number(price);
    console.log("dsdasdsa",numericPtl);

    let transaction = await contract.methods.updatePriceToList(numericPtl).send({from:activeUser});
    setPrice("");
    alert("price to list successfully updated");
    
  }

  const handlePrice = async(event)=>{
    setPrice(event.target.value);
  }

  const getPriceToList = async()=>{
    const {contract}=state;
    let listingPrice = await contract.methods.getPriceToList().call();
    listingPrice=listingPrice/10**18;
    listingPrice = listingPrice + " ethers";
    setPriceToList(listingPrice);
  }
    

return (
    <div>
        <div>
        <Header/>
        </div>
        <div style={{marginTop:"-22px", textAlign:"center"}}>
            
            <h1>Address: {activeUser}</h1>
            <h1>Balance: {balance} ethers</h1>
            
            {flag && <button onClick={WithDraw} style={{backgroundColor:"lightGrey",marginTop:"20px",borderRadius:"5px",width:"300px",height:"50px",fontWeight:"Bold"}}>WithDraw Funds</button>}
            {flag && <div><input type="text" value={price} onChange={handlePrice} placeholder="In ETH, 1 will be equal to 0.01" required style={{height:"50px", marginRight:"10px",width:"200px",borderRadius:"5px",fontWeight:"bold",marginTop:"20px",fontSize:"14px"}}/><button onClick={updatePriceToList} style={{backgroundColor:"Lightgrey",borderRadius:"5px",width:"200px",height:"50px",fontWeight:"Bold"}}>Update Price to List</button></div>}
            <div><button onClick = {getPriceToList} style={{backgroundColor:"lightGrey",marginTop:"20px",borderRadius:"5px",width:"300px",height:"50px",fontWeight:"Bold"}}>Get Price To List</button>
            <h1>{priceToList}</h1>
             </div>
        </div>      
    </div>
);

}

export default MyProfile;