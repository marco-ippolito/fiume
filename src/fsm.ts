import { randomUUID } from "crypto";
import {
	AutoTransitionState,
	FinalState,
	GuardState,
	TransitoryState,
	State,
	SubscriptionIdentifier,
	StateIdentifier,
	SubscriptionCallback,
} from "./state.js";
import { validateHydration, validateStates } from "./validate.js";

const PREVENT_COSTRUCTOR_INSTANCE = Symbol("fiume.prevent-constructor");

export type StateMachineOptions<TContext = unknown, TSharedData = unknown> = {
	id?: string;
	context?: TContext;
	sharedData?: TSharedData;
};

export class InvalidTransition extends Error {}
export class InvalidConstructor extends Error {}

export type MachineSnapshot<TContext> = {
	snapshotId: string;
	machineId: string;
	stateId: string;
	context: TContext;
};

export class StateMachine<
	TContext = unknown,
	TEvent = unknown,
	TSharedData = unknown,
> {
	public id: string;
	public context: TContext;
	#finished = false;
	#current!: State<TContext, TEvent, TSharedData>;
	#initial: State<TContext, TEvent, TSharedData>;
	#states: Map<StateIdentifier, State<TContext, TEvent, TSharedData>>;
	#sharedData: TSharedData;
	#subscriptions: Map<SubscriptionIdentifier, SubscriptionCallback>;

	private constructor(
		states: Array<State<TContext, TEvent, TSharedData>>,
		options?: StateMachineOptions<TContext, TSharedData>,
		symbol?: symbol,
		currentStateId?: string,
	) {
		if (symbol !== PREVENT_COSTRUCTOR_INSTANCE) {
			throw new InvalidConstructor(
				"StateMachine must be created with `StateMachine.from`",
			);
		}
		this.id = options?.id || randomUUID();
		this.context = options?.context || ({} as TContext);
		this.#sharedData = options?.sharedData || ({} as TSharedData);
		this.#states = new Map(states.map((s) => [s.id, s]));
		this.#subscriptions = new Map();
		this.#initial = currentStateId
			? (this.#states.get(currentStateId) as State)
			: (states.find((s) => s.initial) as State);
	}

	public get currentStateId() {
		return this.#current.id;
	}

	public get sharedData() {
		return this.#sharedData;
	}

	public get isFinished() {
		return this.#finished;
	}

	public createSnapshot(): MachineSnapshot<TContext> {
		return {
			snapshotId: randomUUID(),
			machineId: this.id,
			stateId: this.#current.id,
			context: structuredClone(this.context),
		};
	}

	public static fromSnapshot<TContext, TEvent, TSharedData>(
		snapshot: MachineSnapshot<TContext>,
		states: Array<State<TContext, TEvent, TSharedData>>,
		sharedData?: TSharedData,
	) {
		const stateId = snapshot.stateId;
		validateHydration(states, stateId);
		const stateMachineOptions = {
			id: snapshot.machineId,
			context: snapshot.context,
			sharedData,
		};
		return new StateMachine(
			states,
			stateMachineOptions,
			PREVENT_COSTRUCTOR_INSTANCE,
			stateId,
		);
	}

	public static from<TContext, TEvent, TSharedData>(
		states: Array<State<TContext, TEvent, TSharedData>>,
		options?: StateMachineOptions<TContext, TSharedData>,
	) {
		validateStates(states);
		return new StateMachine(states, options, PREVENT_COSTRUCTOR_INSTANCE);
	}

	public async send(event: TEvent) {
		if (this.#finished) {
			throw new InvalidTransition(
				"Machine cannot send to a machine in final state",
			);
		}

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

	private async enter(
		state: State<TContext, TEvent, TSharedData>,
		event?: TEvent,
	) {
		this.#current = state;
		if (state.onEntry) {
			await state.onEntry({
				context: this.context,
				sharedData: this.#sharedData,
				event,
			});
		}

		for (const sub of this.#subscriptions.values()) {
			sub({
				context: this.context,
				currentStateId: this.#current.id,
				sharedData: this.#sharedData,
			});
		}

		if (
			(state as FinalState).final ||
			(state as AutoTransitionState).autoTransition
		) {
			await this.executeState(this.#current);
		}
	}

	private async executeState(
		state: State<TContext, TEvent, TSharedData>,
		event?: TEvent,
	) {
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
				event,
			});
		}

		const f = state as FinalState;
		if (f.final) {
			if (f.onFinal) {
				await f.onFinal({
					context: this.context,
					sharedData: this.#sharedData,
					event,
				});
			}
			this.#finished = true;
			return;
		}

		if (!destination) throw new InvalidTransition("Invalid destination node");

		await this.enter(destination);
	}

	public subscribe(callback: SubscriptionCallback): SubscriptionIdentifier {
		const id = randomUUID();
		this.#subscriptions.set(id, callback);
		return id;
	}

	public unsubscribe(id: string): void {
		this.#subscriptions.delete(id);
	}
}
