var CelebritySignature = artifacts.require("CelebritySignature");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(CelebritySignature,{ gas: 5000000 });
};