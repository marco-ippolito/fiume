export type StateIdentifier = string;

export type HookInput<TContext = unknown, TEvent = unknown> = {
	context: TContext;
	event?: TEvent;
};

export type TransitionToHook<TContext = unknown, TEvent = unknown> = (
	hook: HookInput<TContext, TEvent>,
) => StateIdentifier | Promise<StateIdentifier>;

export type OnFinalHook<TContext = unknown> = (
	hook: HookInput<TContext, unknown>,
) => unknown | Promise<unknown>;
export type OnEntryHook<TContext = unknown, TEvent = unknown> = (
	hook: HookInput<TContext, TEvent>,
) => unknown | Promise<unknown>;
export type OnExitHook<TContext = unknown, TEvent = unknown> = (
	hook: HookInput<TContext, TEvent>,
) => unknown | Promise<unknown>;

export type TransitionEvent<TContext = unknown, TEvent = unknown> = (
	hookInput: HookInput<TContext, TEvent>,
) => boolean | Promise<boolean>;

export interface InitialState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	initial: true;
	transitionTo: TransitionToHook<TContext, TEvent>;

	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
}

interface InitialNonFinalState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	initial: true;
	transitionTo: TransitionToHook<TContext, TEvent>;
	final: false;

	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
}

interface InitialAutoTransitionState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	initial: true;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent>;
}

interface InitialAutoTransitionNonFinalState<
	TContext = unknown,
	TEvent = unknown,
> {
	id: StateIdentifier;
	initial: true;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent>;
	final: false;
}

export interface TransitoryState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	transitionTo: TransitionToHook<TContext, TEvent>;

	initial?: boolean;
	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
}

interface TransitoryNonFinalState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	transitionTo: TransitionToHook<TContext, TEvent>;
	final: false;

	initial?: boolean;
	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
}

interface TransitoryAutoTransitionState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent>;

	initial?: boolean;
}

interface TransitoryAutoTransitionNonFinalState<
	TContext = unknown,
	TEvent = unknown,
> {
	id: StateIdentifier;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent>;
	final: false;

	initial?: boolean;
}

export interface FinalState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	final: true;

	initial?: false;
	onFinal?: OnFinalHook<TContext>;
}

export interface StateHooks<TContext = unknown, TEvent = unknown> {
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
}

export type AutoTransitionState<TContext = unknown, TEvent = unknown> =
	| InitialAutoTransitionState
	| InitialAutoTransitionNonFinalState
	| TransitoryAutoTransitionState
	| TransitoryAutoTransitionNonFinalState;

export type GuardState<TContext = unknown, TEvent = unknown> = Extract<
	State<TContext, TEvent>,
	{ transitionGuard?: TransitionEvent<TContext, TEvent> }
>;

export type State<TContext = unknown, TEvent = unknown> = StateHooks &
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
