const delay = (timeout: number = 5000) => {
	return new Promise((resolve) => setTimeout(resolve, timeout));
};
export const swap = async (values: { fromToken: string; toToken: string; amount: number }) => {
	await delay(3000);
	return { ...values, status: 'OK' };
};
