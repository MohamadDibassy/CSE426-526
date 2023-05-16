
import React, { useState } from "react";
import Header from "./Header";
import CelebritySignature from '../contracts/CelebritySignature.json';
import { useEffect } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./Pinata";
import Web3 from "web3"; 
import {ethers} from 'ethers';

function ListNFT() {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const[hash,setHash]=useState("");
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const[message,updateMessage]=useState("");
  const[activeUser,updateActiveUser]=useState("");
  const [priceToList,setPriceToList] = useState("");
  const [state, setState] = useState({
    web3: null,
    contract: null
  });


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
    getPriceToList();
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

  const getPriceToList = async()=>{
    const {contract}=state;
    let listingPrice = await contract.methods.getPriceToList().call();
    listingPrice=listingPrice/10**18;
    listingPrice = listingPrice + " ethers";
    setPriceToList(listingPrice);
  }

  //// This is an asynchronous function that handles file upload
    async function OnChangeFile(e) {
      // Get the file object from the event
        var file = e.target.files[0];
        
        try {
            // Update a message to inform the user that the file is being uploaded
            updateMessage("Uploading image.. please dont click anything!")
             // an async function called 'uploadFileToIPFS' to upload the file to IPFS
            const response = await uploadFileToIPFS(file);

            // If the response from IPFS indicates a successful upload, update the message to inform the user
        // that the file has been uploaded successfully, and set the photo URL to the URL returned by IPFS
            if(response.success === true) {
                updateMessage("")
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setPhotoURL(response.pinataURL);
            }
        }
        catch(e) {
          // If there was an error during file upload, log the error to the console
            console.log("Error during file upload", e);
        }
    }

    
    async function uploadMetadataToIPFS() {
      //This function uploads the metadata to IPFS which is pinanta
      //checking if all the required fields are there or not
        if( !name || !description || !price || !photoURL)
        {
            updateMessage("Please fill all the fields!")
            return -1;
        }

        // Creating an object with NFT metadata
        const nftJSON = {
            name, description, price, image: photoURL
        }

        try {
            // If the response from IPFS indicates a successful upload, log the success message to the console and return the pinata URL
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("error uploading JSON metadata:", e)
        }
    }

    async function listNFT(e) {
      const {contract}=state;
        e.preventDefault();
       
        console.log("currentUser",activeUser);

        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1){
                console.log("failed uploading");
                return;
            }
            updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")

            
            let listingPrice = await contract.methods.getPriceToList().call();
            console.log("bfore",listingPrice);
            listingPrice=listingPrice/10**18;
            listingPrice=listingPrice.toString();
            console.log("new ",listingPrice);
            listingPrice=ethers.utils.parseEther(listingPrice).toString()
            console.log("sdfsdfsdfsdfdsfds",listingPrice)
            console.log(typeof listingPrice)
            const weiprice=Number(price);
            console.log(typeof weiprice)
            const nhash=Number(hash)
            console.log(typeof nhash)
            console.log(typeof metadataURL)
            
            //taking gasEstimate first and passing it as an argument in send to ensure that it should not run out of gas
            const gasEstimate = await contract.methods.ListItem(metadataURL, weiprice, nhash).estimateGas({ from: activeUser, to: contract.options.address, value: listingPrice });
            //interacting with the smart contract method ListItem()
            let transaction = await contract.methods.ListItem(metadataURL, weiprice, nhash).send({ from: activeUser, to: contract.options.address, value: listingPrice, gas: gasEstimate});
              alert("Successfully listed your NFT!");
              //setting all the fields of the form empty after successful upload
              updateMessage("");
              setHash("");
              setName("");
              setDescription("");
              setPrice("");
              
            //window.location.replace("/");
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

//handling the changes as soon as it happens in the text area and updating the corresponding variable

// The hash value is there to make sure that the person cant list duplicated of the same nft as the hash numbers are kept 
// tracked so cant enter duplicate hashnumbers while generating any nft. Plus its value should be between 1000 -10000 as
// the logic in SC is written in such a way that it only identifies those hashes as valid
  const handlePrice= (event) => {
    setPrice(event.target.value);
  }
  const handleHash= (event) => {
    setHash(event.target.value);
  }
  const handleName= (event) => {
    setName(event.target.value);
  }

  const handleDescription = (event) => {
    setDescription(event.target.value);
  }

  return (
    <div>
    <div style={{marginTop:"-20px"}}>
    <Header/>
    </div>
    <div style={{textAlign:"center"}}>
    <form>
    <h2> Mint Your NFT </h2>
    <h2>Price to List your NFT on our website: {priceToList}</h2>
        <label style={{fontWeight:"Bold",fontSize:"20px"}} >
          Name:
        </label><br/>
        <input type="text" value={name} placeholder="ABC" required style={{height:"80px", width:"600px",fontSize:"20px"}} onChange={handleName}/><br/>
          
        <label style={{fontWeight:"Bold",fontSize:"20px"}}>
          Description
        </label><br/>
        <input type="text"  value={description} required placeholder="Describe your nft" style={{height:"80px", width:"600px",fontSize:"20px"}} onChange={handleDescription}/><br/>
            
        <label style={{fontWeight:"Bold",fontSize:"20px"}}>
          HashCode:
        </label><br/>
        <input type="text" value={hash} required placeholder="Enter this code to verify" style={{height:"80px", width:"600px",fontSize:"20px"}} onChange={handleHash}/><br/>
          
        <label style={{fontWeight:"Bold",fontSize:"20px"}}>
          Price:
        </label><br/>
        <input type="text" value={price} required placeholder="1= 0.1eth" style={{height:"80px", width:"600px",fontSize:"20px"}} onChange={handlePrice}/><br/>
             
       
        <h2>UploadPhoto</h2><input type="file" required onChange={OnChangeFile}/><br/>
        <p>{message}</p>
        <button onClick={listNFT} style={{height:"50px",width:"200px", backgroundColor:"black",color:"orange",fontWeight:"Bold",fontSize:"20px"}}>Mint</button> 
      </form>
      </div>
    </div>
  );
}

export default ListNFT;
