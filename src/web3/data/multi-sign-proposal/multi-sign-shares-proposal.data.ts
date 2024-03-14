import {GovernanceProposalData, GovernanceProposalSignatureType} from './base/governance-proposal.data.js';
import {ProposalWithStateData} from '../../../web2/data/multi-sign-proposal/proposal-with-state.data.js';
import {
    BlockchainDefinition,
    type NumericResult,
    type ReadOnlyWeb3Connection
} from '@unleashed-business/ts-web3-commons';
import {Web3ServicesContainer} from '../../../web3-services.container.js';
import {HttpServicesContainer} from '../../../http-services.container.js';
import {bigNumberPipe} from '@unleashed-business/ts-web3-commons/dist/utils/contract-pipe.utils.js';
import type {BatchRequest} from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";

export class MultiSignSharesProposalData extends GovernanceProposalData {
    private static companyOwnershipTokenCache: {
        [index: string]: { collection: string; token: number };
    } = {};

    private availableShares = 0;
    private requiredSharesSigned = 0;
    private currentSharesSigned = 0;

    constructor(
        proposal: ProposalWithStateData,
        connection: ReadOnlyWeb3Connection,
        web3: Web3ServicesContainer,
        web2: HttpServicesContainer,
    ) {
        super(proposal, connection, web3, web2);
    }

    public override get voteSignatures(): GovernanceProposalSignatureType[] {
        return [
            {
                type: 'Shares Signed',
                requiredPercent: this.availableShares > 0 ? this.requiredSharesSigned / this.availableShares : 0,
                currentPercent: this.availableShares > 0 ? this.currentSharesSigned / this.availableShares : 0,
            },
        ];
    }

    public override get newMembersList(): string[] {
        return [];
    }

    protected async loadAdditionalData(
        _: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
    ): Promise<void> {
        const entityContract = this.web3.multiSignSharesEntity.readOnlyInstance(config, this.proposal.entityAddress);

        if (typeof MultiSignSharesProposalData.companyOwnershipTokenCache[this.proposal.entityAddress] === 'undefined') {
            const cacheData = {collection: '', token: 1};
            [cacheData.collection, cacheData.token] = await Promise.all([
                entityContract.ownershipCollection<string>({}).then(x => x as string),
                entityContract
                    .ownershipTokenId<NumericResult>({}).then(x => bigNumberPipe(x as NumericResult))
                    .then((x) => x.toNumber()),
            ]);
            MultiSignSharesProposalData.companyOwnershipTokenCache[this.proposal.entityAddress] = cacheData;
        }

        const {collection, token} = MultiSignSharesProposalData.companyOwnershipTokenCache[this.proposal.entityAddress];

        await this.web3.ownershipSharesNFTCollection.views
            .totalSupply<NumericResult>(config, collection, {id: token}, web3Batch, (result) => {
                this.availableShares = bn_wrap(result).toNumber();
            });
        await entityContract
            .requiredSignatures<NumericResult>({'': this.proposal.proposalId}, web3Batch, (result) => {
                this.requiredSharesSigned = bn_wrap(result).toNumber();
            });
        await entityContract
            .currentSharesSigned<NumericResult>({proposalId: this.proposal.proposalId}, web3Batch, (result) => {
                this.currentSharesSigned = bn_wrap(result).toNumber();
            });
    }
}
