import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AptosApi implements ICredentialType {
	name = 'aptosApi';
	displayName = 'Aptos API';
	documentationUrl = 'https://docs.aptosfoundation.org/apis/fullnode-rest-api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.mainnet.aptoslabs.com/v1',
			required: true,
			description: 'Base URL for the Aptos API',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description: 'API key for authenticated endpoints. Optional for public endpoints.',
		},
	];
}