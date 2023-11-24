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

export type StateMachineOptions<TContext = unknown, TSharedData = unknown> = {
	id?: string;
	context?: TContext;
	sharedData?: TSharedData;
};

export class InvalidTransition extends Error {}
export class InvalidConstructor extends Error {}

export class StateMachine<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	public id: string;
	public context: TContext;
	#current!: State<TContext, TEvent, TSharedData>;
	#initial: State<TContext, TEvent, TSharedData>;
	#states: Map<string, State<TContext, TEvent, TSharedData>>;
	#sharedData: TSharedData;

	private constructor(
		states: Array<State<TContext, TEvent, TSharedData>>,
		options?: StateMachineOptions<TContext, TSharedData>,
		symbol?: symbol,
	) {
		if (symbol !== PREVENT_COSTRUCTOR_INSTANCE) {
			throw new InvalidConstructor(
				"StateMachine must be created with `StateMachine.from`",
			);
		}
		this.id = options?.id || randomUUID();
		this.context = options?.context || ({} as TContext);
		this.#sharedData = options?.sharedData || ({} as TSharedData);
		this.#initial = states.find((s) => s.initial) as State;
		this.#states = new Map(states.map((s) => [s.id, s]));
	}

	public get currentStateId() {
		return this.#current.id;
	}

	public set sharedData(s: TSharedData) {
		this.#sharedData = s;
	}

	public get sharedData() {
		return this.#sharedData;
	}

	static from<TContext, TEvent, TSharedData>(
		states: Array<State<TContext, TEvent>>,
		options?: StateMachineOptions<TContext, TSharedData>,
	) {
		validateStates(states);
		return new StateMachine(states, options, PREVENT_COSTRUCTOR_INSTANCE);
	}

	public async send(event: TEvent) {
		const hookInput = {
			context: this.context,
			sharedData: this.#sharedData,
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

	private async enter(state: State<TContext, TEvent>) {
		this.#current = state;
		if (state.onEntry) {
			await state.onEntry({
				context: this.context,
				sharedData: this.#sharedData,
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
				sharedData: this.#sharedData,
				event,
			});
			destination = this.#states.get(destinationId);
		}

		if (state.onExit) {
			await state.onExit({
				context: this.context,
				sharedData: this.#sharedData,
			});
		}

		const f = state as FinalState;
		if (f.final) {
			if (f.onFinal) {
				await f.onFinal({
					context: this.context,
					sharedData: this.#sharedData,
				});
			}
			return;
		}

		if (!destination) throw new InvalidTransition("Invalid destination node");

		await this.enter(destination);
	}
}
