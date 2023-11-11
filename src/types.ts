export type StateIdentifier = string;
export type TransitionHook = (
	context: unknown,
) => StateIdentifier | Promise<StateIdentifier>;

export type OnEntryHook = (context: unknown) => void | Promise<void>;
export type OnExitHook = (context: unknown) => void | Promise<void>;

export type StateMachineOptions = { id: string; context: unknown };

export interface State {
	id: StateIdentifier;
	transition: TransitionHook;

	onEntry?: undefined | OnEntryHook;
	onExit?: undefined | OnExitHook;

	initial?: boolean;
	final?: boolean;
}
