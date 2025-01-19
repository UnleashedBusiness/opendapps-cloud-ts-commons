import Web3 from 'web3';
import { EmptyAddress } from '@unleashed-business/ts-web3-commons';

export function web3AddressEq(a: string, b: string): boolean {
  return Web3.utils.toChecksumAddress(a) === Web3.utils.toChecksumAddress(b);
}

export function web3IsEmptyAddress(target: string | null | undefined): boolean {
  return target !== null && target !== undefined && web3AddressEq(target, EmptyAddress);
}
