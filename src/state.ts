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

interface InitialWithFinalFalseState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	initial: true;
	transitionTo: TransitionToHook<TContext, TEvent>;
	final: false;

	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
}

interface InitialWithAutoTransitionState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	initial: true;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent>;
}

interface InitialWithAutoTransitionAndFinalFalseState<
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

interface TransitoryWithFinalFalseState<TContext = unknown, TEvent = unknown> {
	id: StateIdentifier;
	transitionTo: TransitionToHook<TContext, TEvent>;
	final: false;

	initial?: boolean;
	autoTransition?: false;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
}

interface TransitoryWithAutoTransitionState<
	TContext = unknown,
	TEvent = unknown,
> {
	id: StateIdentifier;
	autoTransition: true;
	transitionTo: TransitionToHook<TContext, TEvent>;

	initial?: boolean;
}

interface TransitoryWithAutoTransitionAndFinalFalseState<
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

export interface GenericCallbackState<TContext = unknown, TEvent = unknown> {
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
}

export type AutoTransitionState<TContext = unknown, TEvent = unknown> =
	| InitialWithAutoTransitionState
	| InitialWithAutoTransitionAndFinalFalseState
	| TransitoryWithAutoTransitionState
	| TransitoryWithAutoTransitionAndFinalFalseState;

export type GuardState<TContext = unknown, TEvent = unknown> = State<
	TContext,
	TEvent
> & {
	transitionGuard: TransitionEvent<TContext, TEvent>;
};

export type State<TContext = unknown, TEvent = unknown> = GenericCallbackState &
	(
		| InitialState
		| InitialWithFinalFalseState
		| InitialWithAutoTransitionState
		| InitialWithAutoTransitionAndFinalFalseState
		| TransitoryState
		| TransitoryWithFinalFalseState
		| TransitoryWithAutoTransitionState
		| TransitoryWithAutoTransitionAndFinalFalseState
		| FinalState
	);
