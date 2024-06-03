// create a new web3 instance connected to Sepolia
import {
  toggleModal,
  toggleModalLoading,
  toggleModalError,
} from "./errorModal.js";

import { ABI, contractAddress } from "./contractInfo.js";

var web3 = new Web3("https://rpc2.sepolia.org");

$("#loadWalletButton").click(function () {
  // return if no password is entered
  if ($("#password").val() == "") {
    // show the modal with the error
    toggleModalError("Please enter a password", "error");
    return;
  }

  // load the contents of the file#
  var file = $("#keystoreFile")[0].files[0];
  // return if no file is selected
  if (!file) {
    // show the modal with the error
    toggleModalError("Please select a file", "error");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var keystore = e.target.result;
    var password = $("#password").val();
    try {
      // decrypt the wallet
      var wallet = web3.eth.accounts.decrypt(keystore, password);
      // display the wallet address
      $("#walletAddress").val(wallet.address);
      // display the private key
      $("#privateKey").val(wallet.privateKey);
      // display the keystore
      $("#keystore").val(keystore);
      console.log(wallet);

      getCryptoBalance();
      getTokenBalance();
    } catch (error) {
      console.log(error);
      toggleModalError(error, "error");
    }
  };
  reader.readAsText(file);
});

$("#buyTokensButton").click(function () {
  var privateKey = $("#privateKey").val();

  if (privateKey == "") {
    toggleModalError("Please import a wallet", "error");
    return;
  }

  var wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
  var contract = new web3.eth.Contract(ABI, contractAddress);
  var transaction = contract.methods.buyTickets();
  var encodedABI = transaction.encodeABI();
  var amount = $("#amountToPay").val();
  const amountInEther = String(0.00001 * amount);
  var tx = {
    from: wallet.address,
    to: contractAddress,
    gas: 2000000,
    data: encodedABI,
    value: web3.utils.toWei(amountInEther, "ether"), 
  };
  console.log(tx);

  toggleModalLoading("Transaction in progress", "loading");
  web3.eth.accounts.signTransaction(tx, privateKey).then(function (signedTx) {
    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on("receipt", function (receipt) {
        toggleModalLoading("Transaction in progress", "loading");
        $("#transactionRequest").val(JSON.stringify(tx));
        $("#transactionResult").val(JSON.stringify(receipt));
        toggleModal("Transaction complete", "result");
        getCryptoBalance();
      });
  });
});

$("#sellTokensButton").click(function () {
  var privateKey = $("#privateKey").val();

  if (privateKey == "") {
    toggleModalError("Please import a wallet", "error");
    return;
  }

  var wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
  var amount = $("#amountToSell").val();
  var contract = new web3.eth.Contract(ABI, contractAddress);
  var transaction = contract.methods.returnTokens(amount);
  var encodedABI = transaction.encodeABI();

  var tx = {
    from: wallet.address,
    to: contractAddress,
    gas: 2000000,
    data: encodedABI,
  };
  console.log(tx);

  // show the modal saying that the transaction is in progress
  toggleModalLoading("Transaction in progress", "loading");

  web3.eth.accounts.signTransaction(tx, privateKey).then(function (signedTx) {
    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on("receipt", function (receipt) {
        $("#transactionRequest").val(JSON.stringify(tx));
        $("#transactionResult").val(JSON.stringify(receipt));

        // dismiss the modal
        toggleModalLoading("Transaction in progress", "loading");

        toggleModal("Transaction complete", "result");

        getCryptoBalance();
        getTokenBalance();
      });
  });
});

$("#seeInfo").click(function () {
  if ($("#password").val() == "") {
    // show the modal with the error
    toggleModalError("Please enter a password", "error");
    return;
  }

  // load the contents of the file#
  var file = $("#keystoreFile")[0].files[0];
  // return if no file is selected
  if (!file) {
    // show the modal with the error
    toggleModalError("Please select a wallet", "error");
    return;
  }

  toggleModal("", "walletInfo");
});

// when you click cryptoBalanceButton button, check the balance of the wallet
function getCryptoBalance() {
  const walletAddress = $("#walletAddress").val();
  // check if the wallet address is valid
  if (web3.utils.isAddress(walletAddress)) {
    // get the balance of the wallet
    web3.eth.getBalance(walletAddress).then(function (balance) {
      // convert the balance from wei to ether
      const balanceInEther = web3.utils.fromWei(balance, "ether");
      // display the balance
      $("#cryptoBalance").val(balanceInEther);

      // NOTE: Compare your results for your wallet on the sepolia blockchain explorer https://sepolia.etherscan.io/
      // NOTE: You can add Sepolia Crypto to your wallet using the one of the many faucets here https://faucetlink.to/sepolia
    });
  } else {
    // display an error message if the wallet address is invalid
    toggleModalError("Please enter a valid wallet address", "error");
  }
}

// when you click tokenBalanceButton button, check the balance of the token
function getTokenBalance() {
  // get the wallet address from the input field
  const walletAddress = $("#walletAddress").val();
  // get the token address from the input field
  const tokenAddress = contractAddress;
  // check if the wallet address is valid

  if (
    web3.utils.isAddress(walletAddress) &&
    web3.utils.isAddress(tokenAddress)
  ) {
    // create a new contract instance using the ERC20 ABI and the token address
    const contract = new web3.eth.Contract(ABI, tokenAddress);
    // call the balanceOf function of the contract to get the token balance of the wallet
    contract.methods
      .balanceOf(walletAddress)
      .call()
      .then(function (balance) {
        // display the balance
        $("#tokenBalance").val(balance);
        // NOTE: You can get a random token for testing from a dedicated token faucet here https://faucet.quicknode.com/ethereum/sepolia
      });

    contract.methods
      .name()
      .call()
      .then(function (name) {
        // display the token name
        $("#tokenName").text("Token Name: " + name);
      });

    contract.methods
      .symbol()
      .call()
      .then(function (symbol) {
        // display the token symbol
        $("#tokenSymbol").text("Token Symbol: " + symbol);
      });

    contract.methods
      .decimals()
      .call()
      .then(function (decimals) {
        // display the token decimals
        $("#tokenDecimals").text("Token Decimals: " + decimals);
      });
    contract.methods
      .totalSupply()
      .call()
      .then(function (totalSupply) {
        // display the token total supply
        $("#tokenTotalSupply").text("Token Total Supply: " + totalSupply);
      });
  } else {
    // display an error message if the wallet address or token address is invalid
    toggleModalError("Please enter a valid wallet and token address", "error");
  }
}
