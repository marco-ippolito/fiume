import { randomUUID } from "crypto";
import {
	AutoTransitionState,
	FinalState,
	GuardState,
	TransitoryState,
	State,
} from "./state.js";
import { validateStates } from "./validate.js";

const PREVENT_COSTRUCTOR_INSTANCE = Symbol("fiume.prevent-constructor");

export type StateMachineOptions<TContext = unknown> = {
	id?: string;
	context?: TContext;
};

export class InvalidTransition extends Error {}
export class InvalidConstructor extends Error {}

export class StateMachine<TContext = unknown, TEvent = unknown> {
	public id: string;
	public context: TContext;
	#current!: State<TContext, TEvent>;
	#initial: State<TContext, TEvent>;
	#states: Map<string, State<TContext, TEvent>>;

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

		this.#initial = states.find((s) => s.initial) as State;
		this.#states = new Map(states.map((s) => [s.id, s]));
	}

	public async send(event: TEvent) {
		const hookInput = {
			context: this.context,
			event,
		};

		const current = this.#current as GuardState;

		if (
			current.transitionGuard &&
			!(await current.transitionGuard(hookInput))
		) {
			return;
		}

		await this.executeState(this.#current, event);
	}

	public async start() {
		await this.enter(this.#initial);
	}

	public get currentStateId() {
		return this.#current.id;
	}

	private async enter(state: State<TContext, TEvent>) {
		this.#current = state;
		if (state.onEntry) {
			await state.onEntry({
				context: this.context,
			});
		}
		if (
			(state as FinalState).final ||
			(state as AutoTransitionState).autoTransition
		) {
			return this.executeState(this.#current);
		}
	}

	private async executeState(state: State<TContext, TEvent>, event?: TEvent) {
		this.#current = state;
		let destination;

		const g = state as TransitoryState;
		if (g.transitionTo) {
			const destinationId = await g.transitionTo({
				context: this.context,
				event,
			});
			destination = this.#states.get(destinationId);
		}

		if (state.onExit) {
			await state.onExit({
				context: this.context,
			});
		}

		const f = state as FinalState;
		if (f.final) {
			if (f.onFinal) {
				await f.onFinal({
					context: this.context,
				});
			}
			return;
		}

		if (!destination) throw new InvalidTransition("Invalid destination node");

		await this.enter(destination);
	}
}
