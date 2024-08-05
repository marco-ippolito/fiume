export type StateIdentifier = string;
export type SubscriptionIdentifier = string;

export type SubscriptionCallbackInput<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = {
	context: TContext;
	currentStateId: StateIdentifier;
	sharedData: TSharedData;
	event?: TEvent;
};

export type SubscriptionCallback<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	callback: SubscriptionCallbackInput<TContext, TEvent, TSharedData>,
) => void;

export type HookInput<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = {
	context: TContext;
	sharedData: TSharedData;
	event?: TEvent;
};

export type TransitionToHook<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	hook: HookInput<TContext, TEvent, TSharedData>,
) => StateIdentifier | Promise<StateIdentifier>;

export type OnFinalHook<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	hook: HookInput<TContext, TEvent, TSharedData>,
) => unknown | Promise<unknown>;
export type OnEntryHook<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	hook: HookInput<TContext, TEvent, TSharedData>,
) => unknown | Promise<unknown>;

export type OnExitHook<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	hook: HookInput<TContext, TEvent, TSharedData>,
) => unknown | Promise<unknown>;

export type TransitionEvent<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = (
	hookInput: HookInput<TContext, TEvent, TSharedData>,
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
	/**
	 * If the transition guard returns false, the transition will not be executed.
	 */
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
	/**
	 * If the transition guard returns false, the transition will not be executed.
	 */
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
	/**
	 * If the transition guard returns false, the transition will not be executed.
	 */
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
	/**
	 * If the transition guard returns false, the transition will not be executed.
	 */
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

export interface FinalState<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	id: StateIdentifier;
	final: true;
	initial?: false;
	onFinal?: OnFinalHook<TContext, TEvent, TSharedData>;
}

export interface StateHooks<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	onEntry?: OnEntryHook<TContext, TEvent, TSharedData>;
	onExit?: OnExitHook<TContext, TEvent, TSharedData>;
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
		/**
		 * If the transition guard returns false, the transition will not be executed.
		 */
		transitionGuard?: TransitionEvent<TContext, TEvent, TSharedData>;
	}
>;

export type State<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> = StateHooks<TContext, TEvent, TSharedData> &
	(
		| InitialState<TContext, TEvent, TSharedData>
		| InitialNonFinalState<TContext, TEvent, TSharedData>
		| InitialAutoTransitionState<TContext, TEvent, TSharedData>
		| InitialAutoTransitionNonFinalState<TContext, TEvent, TSharedData>
		| TransitoryState<TContext, TEvent, TSharedData>
		| TransitoryNonFinalState<TContext, TEvent, TSharedData>
		| TransitoryAutoTransitionState<TContext, TEvent, TSharedData>
		| TransitoryAutoTransitionNonFinalState<TContext, TEvent, TSharedData>
		| FinalState<TContext, TSharedData>
	);
