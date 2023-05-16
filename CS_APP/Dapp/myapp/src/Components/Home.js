
import Cards from "./Card";
import Header from './Header';
import CelebritySignature from "../contracts/CelebritySignature.json";
import Web3 from "web3";
import { useState,useEffect } from "react";
import {ethers} from 'ethers';
import axios from "axios";

function Home() {

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

// This function takes in a Pinata URL and returns an IPFS URL for the same file
const GetIpfsUrlFromPinata = (pinataUrl) => {
    var IPFSUrl = pinataUrl.split("/");
    const lastIndex = IPFSUrl.length;
    IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
    return IPFSUrl;
};

// This function is used to get a list of items that have been listed for sale
async function getItemsListedForSale(){
    const {contract} =state;
    //interacted with smart contracts ItemListedForSale to get an array of signatures which contains all the tokenId, tokenURI, seller, owner etc
    let sigList=await contract.methods.ItemsListedForSale().call();
    const signatures = [];
    // Loop through the list of signatures returned by the ItemsListedForSale function
    for (const i of sigList) {
    try {

      // Fetched the token URI for the signature as it was mapped with the tokenID of each signature in my smart contract
        const tokenURI = await contract.methods.tokenURI(i.sigID).call();
        console.log("getting this tokenUri", tokenURI);
        const ipfsUrl = GetIpfsUrlFromPinata(tokenURI);
        console.log("edfasdsadsadasdasdas",ipfsUrl);
        const { data: meta } = await axios.get(ipfsUrl);
         // Formatting the price of the signature to ether
        const price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        console.log("signature id", i.sigID);
         // Creating a signature object with the necessary information
        const sig = {
        price,
        tokenId: i.sigID,
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
        originalSeller:i.originalSeller
        };

        //push the newly created signature object to the signatures array
        signatures.push(sig);
    } catch (error) {
        console.error(`Error while processing item ${i.sigID}: ${error}`);
    }
    }
    updateData(signatures);
    console.log(data);
    // Call the updateGotData function to indicate that the data has been fetched because there is a check written just after this function
    // inorder to ensure that the data dont get continueosly updated in a loop
    updateGotData(true);

    
}
if(!gotData){
    getItemsListedForSale()
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
                        <Cards data={value} />
                    </div>
                );
            })}
        </div>      
    </div>
);

}

export default Home;