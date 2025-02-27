import { contractAddress } from 'config';
import json from 'contracts/ping-pong.abi.json';
import { AbiRegistry, Address, SmartContract } from './sdkDappCore';

const abi = AbiRegistry.create(json);
console.log(abi);


export const smartContract = new SmartContract({
  address: new Address(contractAddress),
  abi
});
