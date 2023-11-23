import { randomUUID } from "crypto";
import {
	AutoTransitionState,
	FinalState,
	GenericInitialState,
	GenericState,
	GuardState,
	InitialAutoTransitionState,
	InitialGuardState,
	State,
} from "./state.js";
import { validateStates } from "./validate.js";

const PREVENT_COSTRUCTOR_INSTANCE = Symbol("prevent-constructor");

export type StateMachineOptions<TContext = unknown> = {
	id?: string;
	context?: TContext;
};

export class InvalidTransition extends Error {}
export class InvalidConstructor extends Error {}

export class StateMachine<TContext = unknown, TEvent = unknown> {
	public id: string;
	public context: TContext;
	public controller: AbortController;
	private _current!: State<TContext, TEvent>;
	private _initial: GenericInitialState<TContext, TEvent>;
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

		this._initial = states.find(
			(s) => (s as GenericInitialState).initial,
		) as GenericInitialState;
		this._states = this._states = new Map(states.map((s) => [s.id, s]));
	}

	public async send(event: TEvent) {
		const hookInput = {
			context: this.context,
			signal: this.controller.signal,
			event,
		};

		const current = this._current as GuardState | InitialGuardState;
		if (current.transitionGuard) {
			const res = await current.transitionGuard(hookInput);
			if (!res) return;
		}

		await this.executeState(this._current, event);
	}

	public async start() {
		await this.enter(this._initial);
	}

	public get currentStateId() {
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
		if (
			(state as AutoTransitionState | InitialAutoTransitionState)
				.autoTransition ||
			(state as FinalState).final
		) {
			return this.executeState(this._current);
		}
	}

	private async executeState(state: State<TContext, TEvent>, event?: TEvent) {
		this._current = state;
		let destination;

		const g = state as GenericState | GenericInitialState;
		if (g.transitionTo) {
			const destinationId = await g.transitionTo({
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

		const f = state as FinalState;
		if (f.final) {
			if (f.onFinal) {
				await f.onFinal({
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
