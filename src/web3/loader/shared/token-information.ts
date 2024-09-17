import {DefaultEVMNativeTokenDecimalSize} from "@unleashed-business/ts-web3-commons";
import {BigNumber} from "bignumber.js";

export class TokenMinimalInformation {
    public name: string = '';
    public address: string = '';
    public decimals: number = DefaultEVMNativeTokenDecimalSize;
    public ticker: string = '';
}

export class TokenExtendedInformation extends TokenMinimalInformation {
    public totalSupply: BigNumber = new BigNumber(0);
}