import React from "react";
import { ethers } from "ethers";
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";

export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenData: undefined,
      selectedAddress: undefined,
      balance: undefined,
      feePercentage: undefined,
      ownerAddress: undefined,
      newFee: "",
    };
  }

  render() {
    if (window.ethereum === undefined) {
      return <div>Please install MetaMask</div>;
    }

    if (!this.state.selectedAddress) {
      return <button onClick={() => this._connectWallet()}>Connect Wallet</button>;
    }

    return (
      <div>
        <h1>{this.state.tokenData?.name} ({this.state.tokenData?.symbol})</h1>
        <p>Your address: {this.state.selectedAddress}</p>
        <p>Your MTK balance: {this._formatBalance(this.state.balance)} {this.state.tokenData?.symbol}</p>
        <p>Current transaction fee: {this.state.feePercentage / 100}%</p>

        {/* Transfer MTK Section */}
        <h3>Transfer MTK</h3>
        <input type="text" id="recipient" placeholder="Recipient Address" />
        <input type="number" id="amount" placeholder="Amount" />
        <button onClick={() => this._transferMTK()}>Send</button>

        {/* Modify Fee (Only for Owner) */}
        {this.state.selectedAddress.toLowerCase() === this.state.ownerAddress?.toLowerCase() && (
          <div>
            <h3>Modify Transfer Fee (Owner Only)</h3>
            <input
              type="number"
              onChange={(e) => this.setState({ newFee: e.target.value })}
              placeholder="Enter new fee (basis points)"
            />
            <button onClick={() => this._setTransactionFee()}>Set Fee</button>
          </div>
        )}
      </div>
    );
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: "eth_requestAccounts" });
    this._initialize(selectedAddress);
  }

  async _initialize(userAddress) {
    this.setState({ selectedAddress: userAddress });

    this._provider = new ethers.providers.Web3Provider(window.ethereum);
    this._token = new ethers.Contract(contractAddress.Token, TokenArtifact.abi, this._provider.getSigner(0));

    const name = await this._token.name();
    const symbol = await this._token.symbol();
    const feePercentage = await this._token.feePercentage();
    const owner = await this._token.owner();
    const balance = await this._token.balanceOf(userAddress);

    this.setState({
      tokenData: { name, symbol },
      feePercentage: feePercentage.toNumber(),
      ownerAddress: owner,
      balance,
    });
  }

  async _transferMTK() {
    try {
      const recipient = document.getElementById("recipient").value;
      const amount = document.getElementById("amount").value;
      if (!recipient || !amount) {
        alert("Please enter recipient address and amount.");
        return;
      }

      const amountInWei = ethers.utils.parseUnits(amount, 18);
      const tx = await this._token.transfer(recipient, amountInWei);
      await tx.wait();
      alert(`✅ Successfully sent ${amount} MTK to ${recipient}`);
      this._initialize(this.state.selectedAddress); // Refresh balance
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("❌ MTK Transfer Failed!");
    }
  }

  async _setTransactionFee() {
    if (this.state.selectedAddress.toLowerCase() !== this.state.ownerAddress?.toLowerCase()) {
      alert("❌ Only the owner can change the transaction fee!");
      return;
    }

    try {
      const tx = await this._token.setTransactionFee(this.state.newFee);
      await tx.wait();
      this.setState({ feePercentage: this.state.newFee });
      alert("✅ Transaction fee updated successfully!");
    } catch (error) {
      console.error("Failed to set transaction fee:", error);
      alert("❌ Failed to update transaction fee!");
    }
  }

  _formatBalance(balance) {
    if (!balance) return "0";
    return parseFloat(ethers.utils.formatUnits(balance, 18)).toFixed(4);
  }
}