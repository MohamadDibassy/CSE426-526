// SPDX-License-Identifier: UN
pragma solidity 0.8.19;  //running on latest version of compiler as openzeppelin sometimes gives warnings

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CelebritySignature is ERC721URIStorage{

    address payable owner;      //so that we can make the person who deploys this sc the owner of this sc.
    //made it payable so that it can withdraw funds

    uint priceToListItems = 0.01 ether;    //this is the price anyone has to pay to list their items on our app
    uint tokenIdIndex=0;

    mapping(uint=>SignatureDetails) private IdMappedToSigDetails;  
    mapping(uint=>uint) private IDMappedToCertificateHash;   // to counter duplicacy

    struct SignatureDetails{
        uint sigID;
        uint price;
        bool forSale;     // this tell whether the item is still listed or not
        uint certificateHash;   // this is to verify validity
        address payable owner;
        address payable seller;
        address payable originalSeller;   // who orginally minted the item, he will get 10% commision on every trade of the nft he minted
    }   

    event ItemListedSuccessfully();
    event ItemBuyedSuccessfully();
    
    modifier onlyOwner(){
        require(msg.sender==owner,"You are not allowed to update the price to list items");
        _;
    }

    constructor() ERC721("CELEBSIGNTOKEN","CST"){
        owner= payable(msg.sender);
    }

    // people have to pay fees to list items on our app so with this they can view the current listing price and as the popularity of my website increase I can increase the listing price
    function getPriceToList() public view returns(uint){
        return priceToListItems;
    }

    // with popularity Only owner of the SC can change the price to list
    function updatePriceToList(uint price) public onlyOwner{
        priceToListItems=(price)*10**16;   
    }

    function OwnerOfSC() public view returns(address){
        return owner;
    }

    // we tried to implement something like before selling any signature, the person need to go
    // to any signature verification agency where they will take the hard copy from the owner and
    // give a digitally watermarked version of the signature with a unique hashcode(which will be verified in our smart contract)
    // Only this digitally watermarked file can be traded on our website.
    // While generating this hashcode we must include the etherium address of that owner as well so that no one else can list it from any other account

    // Right now we are generating dummy values of this hashcode but later in stage 2, we can shift to real implementation

    function ListItem(string memory tokenURI, uint enteredPrice, uint certificateHash) public payable {
        uint price=enteredPrice* 10**17;
        require(msg.value==priceToListItems, "Please give atleast the amount required to list items");
        require(price>priceToListItems,"The price of the product should be greater than the listing price atleast");
        require(certificateHash>1000 && certificateHash<10000, "You dont have a valid certification no., please verify your signature from XYZ agency to get valid certificate number");
        
        bool checker=true;
        for(uint i=1; i<=CurrentTokenID();i++){
            if(IDMappedToCertificateHash[i]==certificateHash){
                checker=false;
                break;
            }
        }
        require(checker, "Cant list the same physical asset twice");

        increment();
        uint currentTokenId = CurrentTokenID();
        _safeMint(msg.sender,currentTokenId);
        _setTokenURI(currentTokenId,tokenURI);

        IDMappedToCertificateHash[currentTokenId] = certificateHash; 
        IdMappedToSigDetails[currentTokenId] = SignatureDetails(currentTokenId,price,true,
                                    certificateHash,payable(address(this)),payable(msg.sender),payable(msg.sender));

        _transfer(msg.sender,address(this),currentTokenId);

    }

    // this function is to get the nfts owned by any particular person
    function getMyNFT() public view returns(SignatureDetails[] memory){
        // I cound have used the dynamic array but its gas expensive so used fixed size array only, but due to that have to place an extra for loop so not sure about the tradeoff
        uint count;
        for(uint i=1;i<=CurrentTokenID();i++){
            if(IdMappedToSigDetails[i].owner==msg.sender  || IdMappedToSigDetails[i].seller==msg.sender){
                count++;
            }
        }

        SignatureDetails[] memory myNFT=new SignatureDetails[](count);
        uint myNFTindex=0;
        for(uint i=1;i<=CurrentTokenID();i++){
            if(IdMappedToSigDetails[i].owner==msg.sender  || IdMappedToSigDetails[i].seller==msg.sender){
                myNFT[myNFTindex]=IdMappedToSigDetails[i];
                myNFTindex++;
            }
        }

        return myNFT;
    }

    // when someone buys nft, owner and seller will be that person who buys it and forSale will be false
    function buyItem(uint tokenID) public payable{
        // 10% of the price of any nft will go to the original person (who listed it for the first time) when any transfer of ownership takes place
        // so lets say the A (1st person) listed a CR7 sig for 10 eth, sold it to B. Now B wants to sell this sig to C. So if he lists the price as 
        // 10 eth, then B will only get 9eth and 1 eth will go to A(original seller), so B has to sell at any price above than 11eth to make some profit
        // This is how nft sig will becomes more and more valueable as the transactions including that nft increases. 

        require(msg.value==IdMappedToSigDetails[tokenID].price, "Please provide exact amount requested to buy the product");
        require(IdMappedToSigDetails[tokenID].forSale==true, "Not listed for sale");
        require(IdMappedToSigDetails[tokenID].owner==address(this), "Smart contract is not allowed to sell this product");
        
        IdMappedToSigDetails[tokenID].originalSeller.transfer(msg.value/10);
        IdMappedToSigDetails[tokenID].seller.transfer(msg.value - msg.value/10);
        _transfer(address(this), msg.sender, tokenID);
        IdMappedToSigDetails[tokenID].owner = payable(msg.sender);
        IdMappedToSigDetails[tokenID].seller = payable(msg.sender);
        IdMappedToSigDetails[tokenID].forSale = false;   // not listed until owner thinks of reselling it    
    }

    // these are those items whose owner is Sc which means those items for which their owners gave Sc authority to sell their nft on their behalf
    function ItemsListedForSale() public view returns(SignatureDetails[] memory){
        uint count;
        for(uint i=1;i<=CurrentTokenID();i++){
            if(IdMappedToSigDetails[i].owner==address(this)){
                count++;
            }
        }

        uint index=0;
        SignatureDetails[] memory listedItems= new SignatureDetails[](count);
        for(uint i=1;i<=CurrentTokenID();i++){
            if(IdMappedToSigDetails[i].owner==address(this)){
                listedItems[index]=IdMappedToSigDetails[i];
                index++;
            }
        }
        return listedItems;
    }
    
    // This function is when you want to resell a prepurchased nft, the Sc will become the owner and the owner will be the seller and forSale will be true
    function resalePrepurchasedSignature(uint tokenID, uint enteredPrice) public payable{
        uint price=enteredPrice* 10**17;
        require(! (tokenID>CurrentTokenID()),"Your tokenID is not valid");
        require(IdMappedToSigDetails[tokenID].seller==msg.sender,"You are not authorized to sell something which is not owned by you");
        require(msg.value==priceToListItems,"Please provide required amount to list your items");
        require(price>priceToListItems,"Your price should be greater than the listing price");
        
        _transfer(msg.sender,address(this), tokenID);
        IdMappedToSigDetails[tokenID].owner = payable(address(this));
        IdMappedToSigDetails[tokenID].price=price;
        IdMappedToSigDetails[tokenID].forSale = true;
    
    }

    // this function is to get price of any nft listed for sale or that you own
    function getPriceOfanyNFT(uint tokenID) public view returns(uint){
        if(msg.sender==OwnerOfSC() || msg.sender==IdMappedToSigDetails[tokenID].owner){
            return IdMappedToSigDetails[tokenID].price;
        }
        else{
            require(IdMappedToSigDetails[tokenID].owner==address(this), "The item is not listed for sale so cant tell the price");
            return IdMappedToSigDetails[tokenID].price;
        }
    }

    // this function is to getMinimum price above which you must resell you nft to get any profit as 10% of this price will go to the original seller who minted this nft, so need to take that into account as well before reselling 
    function getMinimumPriceToListBeforeSelling(uint tokenID) public view returns(uint){
        //in order to get any profit you have to sell it atleast above this price
        require(IdMappedToSigDetails[tokenID].owner == msg.sender, "You are not authorized to see price of this nft as you dont own it or you already listed it on our website");

        uint minPrice = (IdMappedToSigDetails[tokenID].price + IdMappedToSigDetails[tokenID].price/10);
        return minPrice;
    }

    // just for incrementing tokenIdIndex , taken reference from Counter.sol
    function increment() private {
        tokenIdIndex++;
    }

    function decrement() private {
        tokenIdIndex--;
    }

    function CurrentTokenID() private view returns(uint){
        return tokenIdIndex;
    } 

    // this function is to withdraw funds that came to Sc throught the price people pay to list items
    function withdrawFunds() public onlyOwner returns(uint){
        owner.transfer(address(this).balance);
        return 1;
    }
}


