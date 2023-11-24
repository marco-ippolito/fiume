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

const PREVENT_COSTRUCTOR_INSTANCE = Symbol("fiume.prevent-constructor");
const kCurrent = Symbol("fiume.current");
const kInitial = Symbol("fiume.initial");
const kStates = Symbol("fiume.initial");

export type StateMachineOptions<TContext = unknown> = {
	id?: string;
	context?: TContext;
};

export class InvalidTransition extends Error {}
export class InvalidConstructor extends Error {}

export class StateMachine<TContext = unknown, TEvent = unknown> {
	public id: string;
	public context: TContext;
	private [kCurrent]!: State<TContext, TEvent>;
	private [kInitial]: GenericInitialState<TContext, TEvent>;
	private [kStates]: Map<string, State<TContext, TEvent>>;

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

		this[kInitial] = states.find(
			(s) => (s as GenericInitialState).initial,
		) as GenericInitialState;
		this[kStates] = new Map(states.map((s) => [s.id, s]));
	}

	public async send(event: TEvent) {
		const hookInput = {
			context: this.context,
			event,
		};

		const current = this[kCurrent] as GuardState | InitialGuardState;
		if (current.transitionGuard) {
			const res = await current.transitionGuard(hookInput);
			if (!res) return;
		}

		await this.executeState(this[kCurrent], event);
	}

	public async start() {
		await this.enter(this[kInitial]);
	}

	public get currentStateId() {
		return this[kCurrent].id;
	}

	private async enter(state: State<TContext, TEvent>) {
		this[kCurrent] = state;
		if (state.onEntry) {
			await state.onEntry({
				context: this.context,
			});
		}
		if (
			(state as AutoTransitionState | InitialAutoTransitionState)
				.autoTransition ||
			(state as FinalState).final
		) {
			return this.executeState(this[kCurrent]);
		}
	}

	private async executeState(state: State<TContext, TEvent>, event?: TEvent) {
		this[kCurrent] = state;
		let destination;

		const g = state as GenericState | GenericInitialState;
		if (g.transitionTo) {
			const destinationId = await g.transitionTo({
				context: this.context,
				event,
			});
			destination = this[kStates].get(destinationId);
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
