
import MyNFTCard from './MyNFTCard';
import Header from './Header';
import CelebritySignature from "../contracts/CelebritySignature.json";
import Web3 from "web3";
import { useState,useEffect } from "react";
import {ethers} from 'ethers';
import axios from "axios";

function MyNFT() {

    const [state, setState] = useState({
        web3: null,
        contract: null,
      });
      const[activeUser,updateActiveUser]=useState("");
      const[gotData,updateGotData]=useState(false);
      

     
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


const [data, updateData] = useState([]);

//this entire component is very similar to Home component, just what is different is we are interacting with
//getMyNFT function (instead of ItemsListedForSale) which gives only those signatures that are owned by the person who is the msg.sender ie who is interacting with the smart contract
const GetIpfsUrlFromPinata = (pinataUrl) => {
    var IPFSUrl = pinataUrl.split("/");
    const lastIndex = IPFSUrl.length;
    IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
    return IPFSUrl;
};

async function getMyNFT(){
    const {contract} =state;
    
    let sigList = await contract.methods.getMyNFT().call({from: activeUser});
    console.log(sigList);
    const items = [];
    for (const i of sigList) {
    try {
        const tokenURI = await contract.methods.tokenURI(i.sigID).call();
        console.log("getting this tokenUri", tokenURI);
        const ipfsUrl = GetIpfsUrlFromPinata(tokenURI);
        const { data: meta } = await axios.get(ipfsUrl);
        
        const price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        const priceTolist= await contract.methods.getPriceToList().call();
        const priceToList=priceTolist/10**18;
        
        console.log("signature id", i.sigID);
        console.log(Number(price));
        const onSale = i.forSale.toString();
        console.log(priceTolist)
        let minPrice = (Number(price) + Number(price)*0.2) + Number(priceToList);
        console.log(minPrice);
        const item = {
        price,
        tokenId: i.sigID,
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
        onSale:onSale,
        originalSeller:i.originalSeller,
        minPrice:minPrice
        };
        items.push(item);
    } catch (error) {
        console.error(`Error while processing item ${i.sigID}: ${error}`);
    }
    }
    updateData(items);
    console.log(data);
    updateGotData(true);

    
}
if(!gotData){
    getMyNFT()
}
return (
    <div>
        <Header/>
        <div>
            {data.map((value, index) => {
                return (
                    <div key={index} style={{ display:"flex",
                        flexDirection: "column",
                        alignItems:"center",
                        justifyContent: "center",
                        padding: "10px",
                        }}>
                        <MyNFTCard data={value} />
                    </div>
                );
            })}
        </div>      
    </div>
);

}

export default MyNFT;