import { HTMLAttributes, useEffect, useState, useMemo } from 'react';

interface WalletBalance {
	currency: string;
	amount: number;
}

interface Price {
	currency: string;
	date: Date;
	price: number;
}

const Priorities: { [type: string]: number } = {
	Osmosis: 100,
	Ethereum: 50,
	Arbitrum: 30,
	Zilliqa: 20,
	Neo: 20,
};

const NO_PRIORITY = -99;
const getPriority = (currency: string): number => {
	if (!Priorities[currency]) return NO_PRIORITY;
	return Priorities[currency];
};

class Datasource {
	source: string = '';

	constructor(source: string) {
		this.source = source;
	}

	getPrices(): Promise<Price[]> {
		return fetch(this.source).then((res) => res.json());
	}
}

interface Props extends HTMLAttributes<HTMLDivElement> {}

const WalletPage = (props: Props) => {
	const balances = useWalletBalances();
	const [isFetchingPrices, setIsFetchingPrices] = useState(true);
	const [prices, setPrices] = useState<Price[]>([]);

	useEffect(() => {
		const datasource = new Datasource('https://interview.switcheo.com/prices.json');
		datasource
			.getPrices()
			.then((prices) => {
				setPrices(prices);
			})
			.catch((error) => {
				console.error(error);
			})
			.finally(() => {
				setIsFetchingPrices(false);
			});
	}, []);

	const filteredBalances = useMemo(
		() =>
			balances.filter((balance: WalletBalance) => {
				const balancePriority = getPriority(balance.currency);
				if (balancePriority <= NO_PRIORITY) return false;
				if (balance.amount <= 0) return false;
				return true;
			}),
		[balances]
	);

	const sortedBalances = useMemo(() => {
		if (filteredBalances.length <= 1) return filteredBalances;
		return filteredBalances.sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.currency);
			const rightPriority = getPriority(rhs.currency);
			if (leftPriority > rightPriority) {
				return -1;
			} else if (rightPriority > leftPriority) {
				return 1;
			}
			return 0;
		});
	}, [filteredBalances]);

	const rows = useMemo(() => {
		if (!prices.length || !sortedBalances.length) return null;
		return sortedBalances.map((balance: WalletBalance) => {
			const priceObj = prices.find((p) => p.currency === balance.currency);
			if (priceObj === undefined) return null;

			return (
				<WalletRow
					className={classes.row}
					key={balance.currency}
					amount={balance.amount}
					usdValue={priceObj.price * balance.amount}
					formattedAmount={balance.amount.toFixed()}
				/>
			);
		});
	}, [isFetchingPrices, prices, sortedBalances]);

	return <div {...props}>{isFetchingPrices ? <span>Loading</span> : rows}</div>;
};
