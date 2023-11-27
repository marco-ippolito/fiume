export type StateIdentifier = string;
export type SubscriptionIdentifier = string;

export type SubscriptionCallbackInput<
	TContext = unknown,
	TSharedData = unknown,
> = {
	context: TContext;
	currentStateId: StateIdentifier;
	sharedData: TSharedData;
};

export type SubscriptionCallback<TContext = unknown> = (
	callback: SubscriptionCallbackInput<TContext>,
) => void;

export type HookInput<TContext = unknown, TSharedData = unknown> = {
	context: TContext;
	sharedData: TSharedData;
};

export type TransitionToHook<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	hook: HookInput<TContext, TSharedData> & { event?: TEvent },
) => StateIdentifier | Promise<StateIdentifier>;

export type OnFinalHook<TContext = unknown, TSharedData = unknown> = (
	hook: HookInput<TContext, TSharedData>,
) => unknown | Promise<unknown>;
export type OnEntryHook<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (hook: HookInput<TContext, TSharedData>) => unknown | Promise<unknown>;

export type OnExitHook<TContext = unknown, TSharedData = unknown> = (
	hook: HookInput<TContext, TSharedData>,
) => unknown | Promise<unknown>;

export type TransitionEvent<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	hookInput: HookInput<TContext, TSharedData> & { event?: TEvent },
) => boolean | Promise<boolean>;

export interface InitialState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	initial: true;
	transitionTo: TransitionToHook<TContext, TEvent, TSharedData>;
	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent, TSharedData>;
}

interface InitialNonFinalState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	initial: true;
	transitionTo: TransitionToHook<TContext, TEvent, TSharedData>;
	final: false;

	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent, TSharedData>;
}

interface InitialAutoTransitionState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	initial: true;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent, TSharedData>;
}

interface InitialAutoTransitionNonFinalState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	initial: true;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent, TSharedData>;
	final: false;
}

export interface TransitoryState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	transitionTo: TransitionToHook<TContext, TEvent>;
	initial?: boolean;
	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent, TSharedData>;
}

interface TransitoryNonFinalState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	transitionTo: TransitionToHook<TContext, TEvent, TSharedData>;
	final: false;
	initial?: boolean;
	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent, TSharedData>;
}

interface TransitoryAutoTransitionState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent, TSharedData>;
	initial?: boolean;
}

interface TransitoryAutoTransitionNonFinalState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent, TSharedData>;
	final: false;

	initial?: boolean;
}

export interface FinalState<TContext = unknown, TSharedData = unknown> {
	id: StateIdentifier;
	final: true;
	initial?: false;
	onFinal?: OnFinalHook<TContext, TSharedData>;
}

export interface StateHooks<TContext = unknown, TSharedData = unknown> {
	onEntry?: OnEntryHook<TContext, TSharedData>;
	onExit?: OnExitHook<TContext, TSharedData>;
}

export type AutoTransitionState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> =
	| InitialAutoTransitionState
	| InitialAutoTransitionNonFinalState
	| TransitoryAutoTransitionState
	| TransitoryAutoTransitionNonFinalState;

export type GuardState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = Extract<
	State<TContext, TEvent, TSharedData>,
	{
		transitionGuard?: TransitionEvent<TContext, TEvent, TSharedData>;
	}
>;

export type State<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = StateHooks &
	(
		| InitialState
		| InitialNonFinalState
		| InitialAutoTransitionState
		| InitialAutoTransitionNonFinalState
		| TransitoryState
		| TransitoryNonFinalState
		| TransitoryAutoTransitionState
		| TransitoryAutoTransitionNonFinalState
		| FinalState
	);
