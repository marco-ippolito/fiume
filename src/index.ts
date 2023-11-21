import { randomUUID } from "crypto";
import { validateStates } from "./validate.js";

const PREVENT_COSTRUCTOR_INSTANCE = Symbol("prevent-constructor");

export type StateIdentifier = string;
export type TransitionToHook<TContext = void, TEvent = void> = (
	hook: HookInput<TContext, TEvent>,
) => StateIdentifier | Promise<StateIdentifier>;

export type HookInput<TContext = void, TEvent = void> = {
	context: TContext;
	signal: AbortSignal;
	event?: TEvent;
};

export type OnFinalHook<TContext = void> = (
	hook: HookInput<TContext, unknown>,
) => void | Promise<void>;
export type OnEntryHook<TContext = void, TEvent = void> = (
	hook: HookInput<TContext, TEvent>,
) => void | Promise<void>;
export type OnExitHook<TContext = void, TEvent = void> = (
	hook: HookInput<TContext, TEvent>,
) => void | Promise<void>;

export type StateMachineOptions<TContext = void> = {
	id?: string;
	context?: TContext;
};

export class InvalidTransition extends Error {}
export class InvalidConstructor extends Error {}

export type TransitionEvent<TContext = void, TEvent = void> = (
	hookInput: HookInput<TContext, TEvent>,
) => boolean | Promise<boolean>;

export interface State<TContext = void, TEvent = void> {
	id: StateIdentifier;
	autoTransition?: boolean;
	initial?: boolean;
	final?: boolean;
	transitionGuard?: TransitionEvent<TContext, TEvent>;
	transitionTo?: TransitionToHook<TContext, TEvent>;
	onEntry?: OnEntryHook<TContext, TEvent>;
	onExit?: OnExitHook<TContext, TEvent>;
	onFinal?: OnFinalHook<TContext>;
}

export class StateMachine<TContext = void, TEvent = void> {
	public id: string;
	public context: TContext;
	public controller: AbortController;
	private _current!: State<TContext, TEvent>;
	private _initial: State<TContext, TEvent>;
	private _states: Map<string, State<TContext, TEvent>>;

	static from<TContext, TEvent>(
		states: Array<State<TContext, TEvent>>,
		options?: StateMachineOptions<TContext>,
	) {
		validateStates(states);
		return new StateMachine(states, options, PREVENT_COSTRUCTOR_INSTANCE);
	}

	private constructor(
		states: Array<State<TContext, TEvent>>,
		options?: StateMachineOptions<TContext>,
		symbol?: symbol,
	) {
		if (symbol !== PREVENT_COSTRUCTOR_INSTANCE) {
			throw new InvalidConstructor(
				"StateMachine must be created with `StateMachine.from`",
			);
		}
		this.id = options?.id || randomUUID();
		this.context = options?.context || ({} as TContext);
		this.controller = new AbortController();

		this._initial = states.find((s) => s.initial) as State<TContext, TEvent>;
		this._states = new Map(states.map((s) => [s.id, s]));
	}

	public async send(event: TEvent) {
		const hookInput = {
			context: this.context,
			signal: this.controller.signal,
			event,
		};

		if (
			this._current.transitionGuard &&
			!(await this._current.transitionGuard(hookInput))
		) {
			return;
		}

		await this.executeState(this._current, event);
	}

	public async start() {
		await this.enter(this._initial);
	}

	public getCurrentStateId() {
		return this._current.id;
	}

	private async enter(state: State<TContext, TEvent>) {
		this._current = state;
		if (state.onEntry) {
			await state.onEntry({
				context: this.context,
				signal: this.controller.signal,
			});
		}

		if (state.autoTransition || state.final) {
			return this.executeState(this._current);
		}
	}

	private async executeState(state: State<TContext, TEvent>, event?: TEvent) {
		this._current = state;
		let destination;

		if (state.transitionTo) {
			const destinationId = await state.transitionTo({
				context: this.context,
				signal: this.controller.signal,
				event,
			});
			destination = this._states.get(destinationId);
		}

		if (state.onExit) {
			await state.onExit({
				context: this.context,
				signal: this.controller.signal,
			});
		}

		if (state.final) {
			if (state.onFinal) {
				await state.onFinal({
					context: this.context,
					signal: this.controller.signal,
				});
			}
			return;
		}

		if (!destination) throw new InvalidTransition("Invalid destination node");

		await this.enter(destination);
	}
}
