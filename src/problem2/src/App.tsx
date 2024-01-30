import { useEffect, useState, useMemo, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { swap } from '@/services/mocks';
import { arrayUniqueByKey } from '@/utils/array';

interface Price {
	currency: string;
	date: Date;
	price: number;
}

const formSchema = z.object({
	fromToken: z.string().min(1),
	toToken: z.string().min(1),
	fromAmount: z.coerce.number().positive('From amount must be greater than 0'),
	toAmount: z.coerce.number().positive('To amount must be greater than 0'),
});

type SwapInput = z.infer<typeof formSchema>;

const FormFieldWrapper = ({ children }: { children: ReactNode }) => {
	return <div className='flex gap-2 w-full mb-2 items-end rounded-md bg-secondary p-2 relative'>{children}</div>;
};

function App() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [prices, setPrices] = useState<Price[]>([]);
	const { toast } = useToast();

	const form = useForm<SwapInput>({
		resolver: zodResolver(formSchema),
		reValidateMode: 'onBlur',
		defaultValues: {
			fromAmount: 0,
			toAmount: 0,
		},
	});

	const watchFromToken = form.watch('fromToken');
	const watchToToken = form.watch('toToken');
	const watchFromAmount = form.watch('fromAmount');

	const handleSwitching = () => {
		const { reset, getValues } = form;
		const { fromAmount, toAmount, fromToken, toToken } = getValues();
		if (!!fromToken || !!toToken) {
			reset({
				fromAmount: toAmount,
				toAmount: fromAmount,
				fromToken: toToken,
				toToken: fromToken,
			});
		}
	};

	const filteredPrices = useMemo(() => {
		return arrayUniqueByKey<Price>(
			prices.filter((price) => price.price > 0),
			'currency'
		);
	}, [prices]);

	const getTotalPrice = (tokenAmount: number, type: 'fromToken' | 'toToken') => {
		const priceObj = prices.find((p) => p.currency === form.getValues(type));
		if (priceObj) {
			return (priceObj.price * tokenAmount).toFixed();
		}
		return 0;
	};

	const handleSubmit = async ({ fromToken, toToken, ...rest }: SwapInput) => {
		try {
			setIsSubmitting(true);
			await swap({ fromToken, toToken, amount: rest.fromAmount });
			toast({
				title: 'Swapping result',
				description: 'Token has been swapped successfully !',
			});
		} catch (error) {
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const fromPriceObj = useMemo(() => prices.find((p) => p.currency === watchFromToken), [watchFromToken, prices]);
	const toPriceObj = useMemo(() => prices.find((p) => p.currency === watchToToken), [watchToToken, prices]);

	useEffect(() => {
		fetch('https://interview.switcheo.com/prices.json')
			.then((res) => res.json())
			.then((result) => setPrices(result))
			.catch((err) => console.error(err));
	}, []);

	useEffect(() => {
		if (filteredPrices.length > 0) {
			form.setValue('fromToken', prices[0].currency);
		}
	}, [filteredPrices]);

	useEffect(() => {
		if (fromPriceObj && toPriceObj) {
			form.setValue('toAmount', (watchFromAmount * fromPriceObj.price) / toPriceObj.price);
		}
	}, [watchFromAmount, fromPriceObj, toPriceObj]);

	return (
		<main className='flex justify-center w-svw min-h-svh'>
			<Card className='h-max min-w-[600px] px-4 py-3 mt-10 shadow-lg'>
				<h1 className='font-bold text-xl mb-2'>Swap</h1>
				<Form {...form}>
					<form className='flex flex-col' onSubmit={form.handleSubmit(handleSubmit)}>
						<FormFieldWrapper>
							<FormField
								control={form.control}
								name='fromAmount'
								render={({ field }) => (
									<FormItem className='flex-1 mt-4'>
										<FormLabel>From</FormLabel>
										<FormControl>
											<Input type='number' {...field} />
										</FormControl>
										<FormDescription>${getTotalPrice(field.value, 'fromToken')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='fromToken'
								render={({ field }) => (
									<FormItem className='absolute top-2 right-2'>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger className='w-40'>
													<SelectValue placeholder='Select from' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{filteredPrices.map((p) => (
													<SelectItem value={p.currency} key={p.currency}>
														{p.currency}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
						</FormFieldWrapper>
						<Button type='button' variant='outline' className='mx-auto my-2 w-fit h-fit' onClick={handleSwitching}>
							<ArrowDownIcon className='w-4 h-4' />
						</Button>
						<FormFieldWrapper>
							<FormField
								control={form.control}
								name='toAmount'
								render={({ field }) => (
									<FormItem className='flex-1 mt-4'>
										<FormLabel>To</FormLabel>
										<FormControl>
											<Input type='number' {...field} />
										</FormControl>
										<FormDescription>${getTotalPrice(field.value, 'toToken')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='toToken'
								render={({ field }) => (
									<FormItem className='absolute top-2 right-2'>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger className='w-40'>
													<SelectValue placeholder='Select to' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{filteredPrices.map((p) => (
													<SelectItem value={p.currency} key={p.currency}>
														{p.currency}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
						</FormFieldWrapper>
						<Button className='mt-4' type='submit' isLoading={isSubmitting} disabled={!form.formState.isValid}>
							Submit
						</Button>
					</form>
				</Form>
			</Card>
		</main>
	);
}

export default App;
