import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { abi } from './constants/index'; // ABI file

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Update if needed

function App() {
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState();
  const [funderList, setFunderList] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    setContract(contractInstance);

    fetchBalance(contractInstance);
  };

  const fetchBalance = async (contractInstance) => {
    try {
      const balance = await contractInstance.totalFundRReceive();
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  const fundContract = async () => {
    if (!contract) return;
    try {
      const tx = await contract.fundToThisContract({ value: ethers.parseEther("0.24") });
      await tx.wait();
      fetchBalance(contract);
    } catch (err) {
      console.error("Funding failed", err);
    }
  };

  const withdraw = async () => {
    if (!contract) return;
    try {
      const tx = await contract.withdrawFund();
      await tx.wait();
      fetchBalance(contract);
    } catch (err) {
      console.error("Withdraw failed", err);
    }
  };

  const getFunderList = async () => {
    if (!contract) return;
    try {
      const [addresses, amounts] = await contract.funderList();
      const list = addresses.map((addr, i) => ({
        address: addr,
        amount: ethers.formatEther(amounts[i]),
      }));
      setFunderList(list);
    } catch (err) {
      console.error("Access denied or call failed", err);
    }
  };

  return (
    <div style={{display:"flex", justifyContent:"center",alignItems:"center",width:"100vw",height:"100vh" }}>


      <div style={{ padding: "2rem", backgroundColor: "#faf0cf", borderRadius: "20px" }}>
        <div style={{display:"flex"}}>

        </div>
        <h2 style={{color:"#524005"}} >SimplePayable Contract</h2>
        <button style={{padding:"8px", borderRadius:"9px",border:"2px", backgroundColor:"#f0c63e",color:"#80650d" }}  onClick={connectWallet}>Connect Wallet</button>

        <p style={{ color: "#524005", font: "status-bar", fontSize: "20px" }} >Contract Balance: {balance} ETH</p>
       

        <button style={{padding:"8px", marginRight:"10px", borderRadius:"9px",border:"2px", backgroundColor:"#f0c63e",color:"#80650d" }} onClick={fundContract}>Fund 0.01 ETH</button>
        <button style={{padding:"8px",margin:"10px", borderRadius:"9px",border:"2px", backgroundColor:"#f0c63e",color:"#80650d" }} onClick={withdraw}>Withdraw (Owner only)</button>
        <button  style={{padding:"8px",margin:"10px", borderRadius:"9px",border:"2px", backgroundColor:"#f0c63e",color:"#80650d" }}onClick={getFunderList}>View Funders (Owner only)</button>

        {funderList.length > 0 && (
          <div>
            <h4 style={{color:"#524005"}}>Funders List:</h4>
            <div style={{color:"#524005", padding:"12px",borderRadius:"12px", border:"1px solid #524005"}}>
              {funderList.map((f, idx) => (
                <p key={idx}>{f.address} - {f.amount} ETH</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
