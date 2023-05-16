
import CelebritySignature from '../contracts/CelebritySignature.json';
import { useState,useEffect } from "react";
import {ethers} from 'ethers';
import Web3 from "web3"; 
function MyNFTCard(data) {
  
  const[activeUser,updateActiveUser]=useState("");
  const [state, setState] = useState({
    web3: null,
    contract: null
  });

  const[price,updatePrice]=useState("");


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
      window.ethereum.enable();    //this line
    }
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

  const handlePrice= (event) => {
    updatePrice(event.target.value);
  }

  //There are 2 imp things in this, 
  //1.  It is showing the minWorth along with every NFT, that minimum worth is calculated by getMinimumPriceToListBeforeSelling()
  //    What we are doing here is with every time the nft will change hands or gets traded, its 10% of the selling price
  //    will go to the original minter of the nft and in this manner NFT will get more and more valueable as the trasaction involving 
  //    that nft increases.
  //2.  We are using resalePrepurchasedSignature function to resell the prepurchased nft. It is different from listing a new nft
  //    as we are not minting it again, we are only changing the price and giving authority to our SC to sell it on our behalf
  const Resell = async (event) => {
    const {contract} = state;
    let Id = event.target.dataset.value;
    let numericId= Number(Id);
    let numericPrice=Number(price);
    console.log(Id);

    let listingPrice = await contract.methods.getPriceToList().call();
    listingPrice=listingPrice/10**18;
            listingPrice=listingPrice.toString();
    listingPrice=ethers.utils.parseEther(listingPrice).toString()
    
    const gasEstimate = await contract.methods.resalePrepurchasedSignature(numericId,numericPrice).estimateGas({ from: activeUser, to: contract.options.address, value: listingPrice });
    let transaction = await contract.methods.resalePrepurchasedSignature(numericId,numericPrice).send({ from: activeUser, to: contract.options.address, value: listingPrice, gas: gasEstimate});
    alert('You successfully relisted the NFT on our website!');
  };
  return (

  
    <div style={{border:"solid",borderWidth:"2px",borderColor:"Black",height:"630px",width:"358px",backgroundColor: "#f2f2f2",
                        borderRadius: "10px",padding: "10px"}}>
      <img crossorigin="anonymous" src={data.data.image} style={{height:"300px",width:"100%",objectFit: "cover",borderRadius: "5px"}} />
        <h2 style={{color:"black"}}>{data.data.name}</h2>
          <p  style={{color:"black"}}>{data.data.description}</p>
          <p style={{color:"black"}}>Owner: {data.data.seller}</p>
          <p style={{color:"black"}}>Listed for sale: {data.data.onSale}</p>
          <h3 style={{color:"black"}}>Buyed Price: {data.data.price} ether</h3>
          <h3  style={{color:"black"}}>MinWorth: {data.data.minPrice} Ether</h3>
          <input type="text" onChange={handlePrice} placeholder="1= 0.1eth" required style={{height:"30px", marginRight:"10px",borderRadius:"5px",fontWeight:"bold",fontSize:"14px"}}></input><button onClick={Resell} data-value={data.data.tokenId} style={{backgroundColor:"LightBlue",borderRadius:"5px",width:"150px",height:"30px",fontWeight:"Bold"}}>Resell</button>
    </div>
    
  );
}

export default MyNFTCard;