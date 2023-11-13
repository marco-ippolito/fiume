export const basicStates = [
	{ id: "ON", final: true, onEntry: () => {}, onExit: () => {} },
	{
		id: "OFF",
		initial: true,
		onEntry: () => {},
		onExit: () => {},
		transitionTo: () => "ON",
	},
];

export const basicStatesWithoutInitialDeclared = [
	{ id: "ON", final: true, onEntry: () => {}, onExit: () => {} },
	{
		id: "OFF",
		onEntry: () => {},
		onExit: () => {},
		transitionTo: () => "ON",
	},
];

export const wrongDestination = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		transitionTo: () => "err",
	},
];
