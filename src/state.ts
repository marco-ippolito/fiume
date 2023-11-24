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

export type GenericInitialState<TContext = unknown, TEvent = unknown> =
	| InitialGuardState
	| InitialAutoTransitionState;

export interface InitialGuardState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	initial: boolean;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
	transitionTo: TransitionToHook<TContext, TEvent>;
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
}

export interface InitialAutoTransitionState<
	TContext = unknown,
	TEvent = unknown,
> {
	id: StateIdentifier;
	initial: boolean;
	autoTransition: boolean;
	transitionTo: TransitionToHook<TContext, TEvent>;
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
}

export interface FinalState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	final: boolean;
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
	onFinal?: OnFinalHook<TContext>;
}

export type GenericState<TContext = unknown, TEvent = unknown> =
	| GuardState
	| AutoTransitionState;

export interface GuardState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
	transitionTo: TransitionToHook<TContext, TEvent>;
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
}

export interface AutoTransitionState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	autoTransition: boolean;
	transitionTo: TransitionToHook<TContext, TEvent>;
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
}

export type State<TContext = unknown, TEvent = unknown> =
	| InitialGuardState
	| InitialAutoTransitionState
	| FinalState
	| GuardState
	| AutoTransitionState;
