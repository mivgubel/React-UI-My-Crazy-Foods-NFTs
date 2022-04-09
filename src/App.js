import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = "Mike_Bello90";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/crazy-food-yvv8vmkpaj";
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x15C105277Db5966349434475dF1f355050913f79";

const App = () => {
	/*
	 * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
	 */
	const [currentAccount, setcurrentAccount] = useState("");
	const [Number_NFTs_Minted, setNumber_NFTs_Minted] = useState(0);
	const [loader, setLoader] = useState(false);
	const [MyNFTLink, setMyNFTLink] = useState("");

	// METHOD TO CHECK IF THE USER HAS METAMASK INSTALLED AND AUTHORIZE AN ACCOUNT
	const checkIfWalletIsConnected = async () => {
		/*
		 * First make sure we have access to window.ethereum
		 */
		const { ethereum } = window;
		if (!ethereum) {
			console.log("Make sure you have metamask!");
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		/*
		 * Check if we're authorized to access the user's wallet
		 */
		const accounts = await ethereum.request({ method: "eth_accounts" });

		/*
		 * User can have multiple authorized accounts, we grab the first one if its there!
		 */
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setcurrentAccount(account);

			let chainId = await ethereum.request({ method: "eth_chainId" });
			console.log("Connected to chain " + chainId);

			// String, hex code of the chainId of the Rinkebey test network
			const rinkebyChainId = "0x4";
			if (chainId !== rinkebyChainId) {
				alert("You are not connected to the Rinkeby Test Network!");
			}

			// Setup listener! This is for the case where a user comes to our site
			// and ALREADY had their wallet connected + authorized.
			setupEventListener();
			getNumberNFTsMinted();
		} else {
			console.log("No authorized account found");
		}
	};

	/*
	 * Implement your connectWallet method here
	 * METHOD TO CONNECT A WALLET TO OUR WEBSITE
	 */
	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			/*
			 * Fancy method to request access to account.
			 */
			const accounts = ethereum.request({ method: "eth_requestAccounts" });

			/*
			 * Boom! This should print out public address once we authorize Metamask.
			 */
			console.log("Connected:", accounts[0]);
			setcurrentAccount(accounts[0]);

			let chainId = await ethereum.request({ method: "eth_chainId" });
			console.log("Connected to chain " + chainId);

			// String, hex code of the chainId of the Rinkebey test network
			const rinkebyChainId = "0x4";
			if (chainId !== rinkebyChainId) {
				alert("You are not connected to the Rinkeby Test Network!");
			}

			// Setup listener! This is for the case where a user comes to our site
			// and connected their wallet for the first time.
			setupEventListener();
			//	getNumberNFTsMinted();
		} catch (error) {
			console.log(error);
		}
	};

	// capture Total NFTs Minted Event
	const getNumberNFTsMinted = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const epicNFTContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

				console.log("Checking if there is NFTs available to minted...");
				let txn = await epicNFTContract.getTotalNFTsMinted();
				await txn.wait();

				epicNFTContract.on("NumberNFTMinted", (total_minted) => {
					console.log(total_minted.toNumber());
					setNumber_NFTs_Minted(total_minted.toNumber()); // seteamos el numero de NFTs minteados
				});
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Setup our listener.
	const setupEventListener = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

				// This will essentially "capture" our event when our contract throws it.
				// If you're familiar with webhooks, it's very similar to that!
				connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
					console.log(from, tokenId.toNumber());
					setNumber_NFTs_Minted(tokenId.toNumber() + 1); // seteamos el numero de NFTs minteados
					setMyNFTLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
					//alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
				});

				console.log("Setup event listener!");
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	// METHOD TO MINT AN NFT CALLING THE FUNCTION IN OUR CONTRACT
	const askContractToMintNft = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

				console.log("Going to pop wallet now to pay gas...");
				let nftTxn = await connectedContract.makeAnEpicNFT();

				setLoader(true); // mostramos spinner

				console.log("Mining...please wait.");
				await nftTxn.wait();

				setLoader(false); // ocultamos el spinner

				console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
				//	getNumberNFTsMinted();
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (err) {
			alert(err.message);
			console.log(err);
		}
	};

	// Render Methods
	const renderNotConnectedContainer = () => (
		<button onClick={connectWallet} className="cta-button connect-wallet-button">
			Connect to Wallet
		</button>
	);

	const renderMintUI = () => (
		<button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
			Mint NFT
		</button>
	);

	/*
	 * This runs our function when the page loads.
	 */
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">My NFT Collection</p>
					<p className="sub-text">Each unique. Each beautiful. Discover your NFT today.</p>
					<p className="mint-count">Maximum of NFTs Available: {TOTAL_MINT_COUNT}</p>
					<p className="mint-count">
						NFTs Minted: {Number_NFTs_Minted} / {TOTAL_MINT_COUNT}
					</p>
					<br></br>
					{loader && (
						<>
							<div className="spinner-border text-success" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
							<br></br>
						</>
					)}

					{currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
					<br></br>
					<br></br>
					<br></br>
					<a className="btn btn-success" href={OPENSEA_LINK} role="button">
						🌊 View Collection on OpenSea
					</a>
					<br></br>
					<br></br>
					{MyNFTLink && (
						<div className="alert alert-success" role="alert">
							Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link:
							<a href={MyNFTLink} className="alert-link">
								My NFT in Opensea
							</a>
						</div>
					)}
				</div>

				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">{` @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
