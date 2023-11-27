import { State, StateMachine } from "fiume";

let balance = 1000;

const EVENTS = {
	START: "start",
	BET: "bet",
	STEP: "step",
};

type SlotMachineStartEvent = {
	type: string;
};

type SlotMachineStepEvent = {
	type: string;
};

type SlotMachineBetEvent = {
	type: string;
	value: number;
};

type SlotMachineContext = {
	initialState: number[][];
	balance: number;
	bet: number;
};

function getBalance() {
	return Promise.resolve(balance);
}

function getSlotInitialState() {
	return Promise.resolve([
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	]);
}

function addWin(bet) {
	balance += bet * 10;
	return Promise.resolve(balance);
}

function getRandomSlot() {
	return Promise.resolve([
		[
			Math.floor(Math.random() * 10),
			Math.floor(Math.random() * 10),
			Math.floor(Math.random() * 10),
		],
		[
			Math.floor(Math.random() * 10),
			Math.floor(Math.random() * 10),
			Math.floor(Math.random() * 10),
		],
		[
			Math.floor(Math.random() * 10),
			Math.floor(Math.random() * 10),
			Math.floor(Math.random() * 10),
		],
	]);
}

function removeFromBalance(amount) {
	balance -= amount;
	return Promise.resolve(balance);
}

const slotMachine: Array<
	State<
		SlotMachineContext,
		SlotMachineStartEvent | SlotMachineBetEvent | SlotMachineStepEvent
	>
> = [
	{
		id: "START",
		initial: true,
		transitionGuard: ({ event }) => event?.type === EVENTS.START,
		transitionTo: async ({ context }) => {
			context.initialState = await getSlotInitialState();
			context.balance = await getBalance();
			return "BET";
		},
	},
	{
		id: "BET",
		transitionGuard: ({ event }) => event?.type === EVENTS.BET,
		transitionTo: async ({ event, context }) => {
			const e = event as SlotMachineBetEvent;
			if (e.value > context.balance) {
				throw new Error("INVALID BET AMOUNT");
			}
			context.bet = e.value;
			context.balance = await removeFromBalance(e.value);
			return "STEP";
		},
	},
	{
		id: "STEP",
		transitionGuard: ({ event }) => event?.type === EVENTS.STEP,
		transitionTo: async ({ context }) => {
			const combinations = await getRandomSlot();
			const top = new Set(combinations.map((c) => c[1]));
			const middle = new Set(combinations.map((c) => c[0]));
			const bottom = new Set(combinations.map((c) => c[2]));
			if (top.size === 1 || middle.size === 1 || bottom.size === 1) {
				console.log("WIN!");
				await addWin(context.bet);
			} else {
				console.log("LOST!");
			}
			console.log("balance:", await getBalance());
			return "START";
		},
	},
];

const machine = StateMachine.from(slotMachine, {});
await machine.start();

for (let i = 0; i < 100; i++) {
	await machine.send({ type: EVENTS.START });
	await machine.send({ type: EVENTS.BET, value: 10 });
	await machine.send({ type: EVENTS.STEP });
}
