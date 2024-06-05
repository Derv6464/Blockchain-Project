// create a new web3 instance connected to Sepolia
import {
  toggleModal,
  toggleModalLoading,
  toggleModalError,
} from "./errorModal.js";
import { ABI, contractAddress } from "./contractInfo.js";
var web3 = new Web3("https://rpc2.sepolia.org");

$("#loadWalletButton").click(function () {
  //loading the wallet from the keystore file, cheking password and setting the values to the html
  if ($("#password").val() == "") {
    toggleModalError("Please enter a password", "error");
    return;
  }

  var file = $("#keystoreFile")[0].files[0];
  if (!file) {
    toggleModalError("Please select a file", "error");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var keystore = e.target.result;
    var password = $("#password").val();
    try {
      var wallet = web3.eth.accounts.decrypt(keystore, password);
      $("#walletAddress").val(wallet.address);
      $("#privateKey").val(wallet.privateKey);
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
  //buying tokens
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
  // 0.00001 ETH per token
  const amountInEther = String(0.00001 * amount);
  var tx = {
    from: wallet.address,
    to: contractAddress,
    gas: 2000000,
    data: encodedABI,
    value: web3.utils.toWei(amountInEther, "ether"),
  };
  console.log(tx);

  //calling loading modal until transaction is done
  toggleModalLoading("loading");
  web3.eth.accounts.signTransaction(tx, privateKey).then(function (signedTx) {
    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on("receipt", function (receipt) {
        $("#transactionRequest").val(JSON.stringify(tx));
        $("#transactionResult").val(JSON.stringify(receipt));
        //calling a result modal
        toggleModalLoading("loading");
        toggleModal("Transaction complete", "result");
      });
  });
});

$("#sellTokensButton").click(function () {
  //selling tokens
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

  //calling loading modal until transaction is done
  toggleModalLoading("loading");

  web3.eth.accounts.signTransaction(tx, privateKey).then(function (signedTx) {
    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on("receipt", function (receipt) {
        $("#transactionRequest").val(JSON.stringify(tx));
        $("#transactionResult").val(JSON.stringify(receipt));
        //calling a result modal
        toggleModalLoading("loading");
        toggleModal("Transaction complete", "result");
      });
  });
});

$("#seeInfo").click(function () {
  //opens modal to show wallet info
  if ($("#password").val() == "") {
    toggleModalError("Please enter a password", "error");
    return;
  }

  var file = $("#keystoreFile")[0].files[0];
  if (!file) {
    toggleModalError("Please select a wallet", "error");
    return;
  }

  toggleModal("", "walletInfo");
});

function getCryptoBalance() {
  //getting the balance of the wallet
  const walletAddress = $("#walletAddress").val();
  if (web3.utils.isAddress(walletAddress)) {
    web3.eth.getBalance(walletAddress).then(function (balance) {
      const balanceInEther = web3.utils.fromWei(balance, "ether");
      $("#cryptoBalance").val(balanceInEther);
    });
  } else {
    toggleModalError("Please enter a valid wallet address", "error");
  }
}

function getTokenBalance() {
  //getting the balance of the tokens
  const walletAddress = $("#walletAddress").val();
  const tokenAddress = contractAddress;

  if (
    web3.utils.isAddress(walletAddress) &&
    web3.utils.isAddress(tokenAddress)
  ) {
    const contract = new web3.eth.Contract(ABI, tokenAddress);
    contract.methods
      .balanceOf(walletAddress)
      .call()
      .then(function (balance) {
        $("#tokenBalance").val(balance);
      });

    contract.methods
      .name()
      .call()
      .then(function (name) {
        $("#tokenName").text("Token Name: " + name);
      });

    contract.methods
      .symbol()
      .call()
      .then(function (symbol) {
        $("#tokenSymbol").text("Token Symbol: " + symbol);
      });

    contract.methods
      .decimals()
      .call()
      .then(function (decimals) {
        $("#tokenDecimals").text("Token Decimals: " + decimals);
      });
    contract.methods
      .totalSupply()
      .call()
      .then(function (totalSupply) {
        $("#tokenTotalSupply").text("Token Total Supply: " + totalSupply);
      });
  } else {
    toggleModalError("Please enter a valid wallet and token address", "error");
  }
}
