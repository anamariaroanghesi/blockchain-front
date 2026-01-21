import { contractAddress } from 'config';
import festivalAbi from 'contracts/festival.abi.json';
import { AbiRegistry, Address, SmartContract } from './sdkDappCore';

const abi = AbiRegistry.create(festivalAbi);

export const smartContract = new SmartContract({
  address: new Address(contractAddress),
  abi
});

export const getContractAddress = () => contractAddress;
