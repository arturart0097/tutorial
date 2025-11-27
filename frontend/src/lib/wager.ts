import { ethers } from "ethers";
import { getContract, createPublicClient, http } from "viem";
import { DUEL_ABI } from "./abi/DUEL";
import { mainnet, base } from "viem/chains";
import { GAMEGPT_NFT_STAKING_ABI } from "./abi/GAMEGPT_NFT_STAKING";

export const addressWhitelist = [
  "0x0677b93b557019EEBaAeD22d1eE2DF737C2f0a38",
  "0xEceA00ac07306537dc24A1A73284A0C119Ef63f7",
];

export const checkGameGPTNFTStakeCount = async (
  walletAddress: string
): Promise<bigint> => {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });

  const contract = getContract({
    address: import.meta.env.VITE_GAMEGPT_NFT_STAKING_CONTRACT_ADDRESS,
    abi: GAMEGPT_NFT_STAKING_ABI,
    client: client,
  });

  return await contract.read.userStakeLengths([walletAddress]);
};

export const checkDUELTokenBalance = async (
  walletAddress: string
): Promise<bigint> => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const contract = getContract({
    address: import.meta.env.VITE_DUEL_TOKEN_CONTRACT_ADDRESS,
    abi: DUEL_ABI,
    client: client,
  });

  return await contract.read.balanceOf([walletAddress]);
};

const CONTRACT_ADDRESS = import.meta.env.VITE_WAGER_CONTRACT_ADDRESS;

const abi = [
  "function join(bytes memory gameId) public payable",
  "function setGame(bytes memory gameId, uint entryFee, uint winPercentage, uint highLowSplit, uint maxHighTierWinners) public",
];

export const sendWager = async (
  signer: ethers.Signer | null,
  gameId: string
) => {
  // 🔄 use encodeBytes32String instead of formatBytes32String
  const gameId32 = ethers.encodeBytes32String(gameId);

  try {
    // 🔄 use parseEther at top-level
    const entryFee = ethers.parseEther("0.0001");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    const tx = await contract.join(gameId32, { value: entryFee });

    await tx.wait();
    return true;
  } catch {
    return false;
  }
};
