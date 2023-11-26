export const basicStates = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
	},
];

export const withoutAutoTransition = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		transitionTo: () => "ON",
	},
];

export const wrongDestination = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "err",
	},
];

export const autoTransition = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
	},
];

export const simpleTransitionGuard = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		transitionGuard: ({ event }) => event === "foo",
		transitionTo: () => "ON",
	},
];

export const onEntryContextChange = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
		onEntry: ({ context }) => {
			context.a = 10;
		},
	},
];

export const onExitContextChange = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
		onExit: ({ context }) => {
			context.a = 10;
		},
	},
];

export const onFinalContextChange = [
	{
		id: "ON",
		final: true,
		onFinal: ({ context }) => {
			context.a = 10;
		},
	},
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
	},
];

export const onEntrySharedDataChange = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
		onEntry: ({ sharedData }) => {
			sharedData.a = 10;
		},
	},
];

export const onExitSharedDataChange = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
		onExit: ({ sharedData }) => {
			sharedData.a = 10;
		},
	},
];

export const onFinalSharedDataChange = [
	{
		id: "ON",
		final: true,
		onFinal: ({ sharedData }) => {
			sharedData.a = 10;
		},
	},
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
	},
];

export const transitoryAssignEventToContext = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		transitionGuard: ({ event, context }) => {
			context.foo = event;
			return true;
		},
		transitionTo: ({ event, context }) => {
			context.bar = event;
			return "ON";
		},
	},
];
