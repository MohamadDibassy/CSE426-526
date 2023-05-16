//not entering them in .env so that TA's can run our code and test the functionalities
// const key = "67595c2707889aa5c0d1";
// const secret = "eecd00dd29de84fd06636efa6907aef98e8505169625cb0c0b4d4cb8bc86cbc9";

// const key = "25a64a4b19ce3d12e3e1";
// const secret = "a3b01acc4f1dda0dfe430d80968d5f6edddae1b8371bcf82714b4dce161e8931";


const key = "97551c72c4d487705c2c";
const secret = "046c3d408106cb5c566049a67bdac2c7ef3fc2147214b181953874637c178536";


const axios = require('axios');
const FormData = require('form-data');

// This function uploads a JSON object to IPFS using the Pinata API.
export const uploadJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    
    // Sending a POST request to the Pinata API with the JSON object.
    return axios 
        .post(url, JSONBody, {
            headers: {
                // Setting the Pinata API key and secret key as headers.
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
/// If the request is successful, return the IPFS URL where the JSON object can be accessed.
//// If the request fails, log the error and return an error message.
    });
};

// This function uploads a file to IPFS using the Pinata API.
export const uploadFileToIPFS = async(file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    
    // Create a FormData object to send the file as multipart/form-data
    let data = new FormData();
    data.append('file', file);

    // Adding metadata to the request, including the file name and any key-value pairs.
    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    // Adding pinning options to the request, including the desired CID version and replication policy.
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);

    // Send a POST request to the Pinata API with the file and metadata.
    return axios 
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
            console.log("image uploaded", response.data.IpfsHash)
            return {
               success: true,
               pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
};
//taken reference from : https://dev.to/fidalmathew/send-files-to-ipfs-using-pinata-api-in-reactjs-3c3