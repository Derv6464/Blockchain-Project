import { toggleModalError } from "./errorModal.js";

$(document).ready(function () {
  $("#createWalletButton").click(function () {
    //creating a wallet & setting the values to the html
    var password = $("#password").val();
    if (password == "") {
      toggleModalError("Please enter a password for the Key Store", "error");
      return;
    }
    var web3 = new Web3();
    var wallet = web3.eth.accounts.create();
    $("#walletAddress").val(wallet.address);
    $("#privateKey").val(wallet.privateKey);
    var keystore = web3.eth.accounts.encrypt(wallet.privateKey, password);
    $("#keystore").val(JSON.stringify(keystore));
  });
});

$("#downloadKeystore").click(function () {
  //downloading the keystore file
  var keystore = $("#keystore").val();
  if (keystore == "") {
    alert("Please create a wallet first");
    return;
  }
  var blob = new Blob([keystore], { type: "text/plain;charset=utf-8" });
  var wallet = $("#walletAddress").val();
  saveAs(blob, wallet + ".json");
});

function saveAs(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
