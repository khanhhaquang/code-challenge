interface WalletBalance {
	currency: string;
	amount: number;
}
interface FormattedWalletBalance {
	//TODO:  Should extend from WalletBalance with new field is formatted
	currency: string;
	amount: number;
	formatted: string;
}

class Datasource {
	// TODO: Implement datasource class
}

interface Props extends BoxProps {} //TODO: what is BoxProps ? Should it be React.HTMLAttributes<HTMLDivElement> ?
const WalletPage: React.FC<Props> = (props: Props) => {
	//TODO: no need to define React.FC<Props> if we want to exclude children
	const { children, ...rest } = props; // TODO: no need to do this line
	const balances = useWalletBalances();
	const [prices, setPrices] = useState({});
	//TODO: should define type for this prices value, should be empty array instead of {} because prices from datasource json is array

	useEffect(() => {
		const datasource = new Datasource('https://interview.switcheo.com/prices.json');
		datasource
			.getPrices()
			.then((prices) => {
				setPrices(prices);
			})
			.catch((error) => {
				console.err(error); //TODO: console.error
			});
	}, []);

	const getPriority = (blockchain: any): number => {
		//TODO: blockchain value should be string
		switch (
			blockchain // TODO: Instead of switch case we can return value from mapping object
		) {
			case 'Osmosis': //TODO: Instead of string we can define enum
				return 100; //TODO: Instead of magic number we can return value from mapping object
			case 'Ethereum':
				return 50;
			case 'Arbitrum':
				return 30;
			case 'Zilliqa':
				return 20;
			case 'Neo':
				return 20;
			default:
				return -99; //TODO: should define this fallback number name instead of a magic number
		}
	};

	const sortedBalances = useMemo(() => {
		return balances
			.filter((balance: WalletBalance) => {
				// TODO: should separate .filter + .sort func for better readability
				const balancePriority = getPriority(balance.blockchain); //TODO: balance.currency instead of blockchain
				//TODO: balancePriority should be used  instead of lhsPriority
				if (lhsPriority > -99) {
					if (balance.amount <= 0) {
						// TODO: should return true if amount > 0 ?
						return true;
					}
					//TODO: what if balance.amount > 0 ?
				}
				return false;
			})
			.sort((lhs: WalletBalance, rhs: WalletBalance) => {
				const leftPriority = getPriority(lhs.blockchain); //TODO: balance.currency instead of blockchain
				const rightPriority = getPriority(rhs.blockchain); //TODO: balance.currency instead of blockchain
				if (leftPriority > rightPriority) {
					return -1;
				} else if (rightPriority > leftPriority) {
					return 1;
				}
				//TODO: what if both are equal in priority ?
			});
	}, [balances, prices]); //TODO: getPriority should be in this deps array, prices shouldn't be in this array

	const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
		//TODO: formattedBalances is not used ?
		return {
			...balance,
			formatted: balance.amount.toFixed(),
		};
	});

	const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
		//TODO: formattedBalances should be used instead of sortedBalance ?
		const usdValue = prices[balance.currency] * balance.amount; //TODO: prices is an array so there should be an filter to get appropriate price for this
		return (
			<WalletRow
				className={classes.row} //TODO: where is `classes` ?
				key={index} //TODO: it should be unique id/blockchain for each balance
				amount={balance.amount}
				usdValue={usdValue}
				formattedAmount={balance.formatted}
			/>
		);
	});

	return <div {...rest}>{rows}</div>;
};
