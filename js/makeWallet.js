import { toggleModalError } from './errorModal.js';

$(document).ready(function(){
    $("#createWalletButton").click(function(){

         // alert if empty password
        var password = $("#password").val();
         if(password == ""){
            toggleModalError("Please enter a password for the Key Store","error");
            return;
        }
        // Create a new Web3 instance
        var web3 = new Web3();

        // Create a new wallet
        var wallet = web3.eth.accounts.create();
        // wallet address into the text area
        $("#walletAddress").val(wallet.address);

        // Display the private key
        $("#privateKey").val(wallet.privateKey);


        // Display the keystore file
        var keystore = web3.eth.accounts.encrypt(wallet.privateKey, password);
        $("#keystore").val(JSON.stringify(keystore));

    });
});


$("#downloadKeystore").click(function(){
        var keystore = $("#keystore").val();
        // alert if keystore is empty
        if(keystore == ""){
            alert("Please create a wallet first");
            return;
        }
        var blob = new Blob([keystore], {type: "text/plain;charset=utf-8"});
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

