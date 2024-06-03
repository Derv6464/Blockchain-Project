import { toggleModal, toggleModalError } from "./errorModal.js";

import { ABI, contractAddress } from "./contractInfo.js";

const web3 = new Web3("https://rpc2.sepolia.org");

$("#UserBalanceButton").click(function () {
  const walletAddress = $("#walletAddress").val();
  const tokenAddress = contractAddress;
  if (
    web3.utils.isAddress(walletAddress) &&
    web3.utils.isAddress(tokenAddress)
  ) {
    getUserCryptoBalance(walletAddress);
    getUserTokenBalance(walletAddress, tokenAddress);
  } else {
    toggleModalError("Invalid wallet address", "error");
  }
});

function getUserCryptoBalance(walletAddress) {
  web3.eth.getBalance(walletAddress).then(function (balance) {
    const balanceInEther = web3.utils.fromWei(balance, "ether");
    $("#cryptoBalance").html(
      "Crypto Balance: <strong>" + balanceInEther + " ETH</strong>",
    );
  });
}

function getUserTokenBalance(walletAddress, tokenAddress) {
  const contract = new web3.eth.Contract(ABI, tokenAddress);
  contract.methods
    .balanceOf(walletAddress)
    .call()
    .then(function (balance) {
      $("#tokenBalance").html(
        "Token Balance: <strong>" + balance + " Tickets</strong>",
      );
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
}

$("#VenueBalanceButton").click(function () {
  getVenueCryptoBalance();
  getVenueTokenBalance();
});

function getVenueCryptoBalance() {
  const walletAddress = "0xC881d45D2FE2F23A4346e0B39211059081ceFFDF";
  if (web3.utils.isAddress(walletAddress)) {
    web3.eth.getBalance(walletAddress).then(function (balance) {
      const balanceInEther = web3.utils.fromWei(balance, "ether");
      $("#cryptoBalanceVenue").html(
        "Crypto Balance: <strong>" + balanceInEther + " ETH</strong>",
      );
    });
  } else {
    toggleModal("Invalid wallet address", "error");
  }
}

async function getVenueTokenBalance() {
  const walletAddress = "0xC881d45D2FE2F23A4346e0B39211059081ceFFDF";
  const tokenAddress = contractAddress;
  if (
    web3.utils.isAddress(walletAddress) &&
    web3.utils.isAddress(tokenAddress)
  ) {
    const contract = new web3.eth.Contract(ABI, tokenAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();

    $("#tokenBalanceVenue").html(
      "Token Balance: <strong>" + balance + " Tickets</strong>",
    );

    contract.methods
      .totalSupply()
      .call()
      .then(function (totalSupply) {
        $("#tokenTotalSupplyVenue").text("Token Total Supply: " + totalSupply);
        $("#tokenSoldVenue").text("Token Sold: " + (totalSupply - balance));
      });
  } else {
    toggleModal("An error occured, check your address", "error");
  }
}

$("#DoormanBalanceButton").click(function () {
  const walletAddress = $("#walletAddressDoorman").val();
  const tokenAddress = contractAddress;
  if (
    web3.utils.isAddress(walletAddress) &&
    web3.utils.isAddress(tokenAddress)
  ) {
    getDoormanTokenBalance(walletAddress, tokenAddress);
  } else {
    toggleModalError("Invalid wallet address", "error");
  }
});

async function getDoormanTokenBalance(walletAddress, tokenAddress) {
  const contract = new web3.eth.Contract(ABI, tokenAddress);

  contract.methods
    .balanceOf(walletAddress)
    .call()
    .then(function (balance) {
      if (balance > 0) {
        $("#letIn").html(
          '<article class="pico-background-green-500"><h2>Let In</h2></article>',
        );
      } else {
        $("#letIn").html(
          '<article class="pico-background-red-500"><h2>Do Not Let In</h2></article>',
        );
      }
      $("#tokenBalanceDoor").text("They have: " + balance + " Tickets");
    });
}
