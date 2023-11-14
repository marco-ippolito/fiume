import { randomUUID } from "node:crypto";
import { validateStates } from "./validate.js";
import EventEmitter from "node:stream";

const PREVENT_COSTRUCTOR_INSTANCE = Symbol();

export type StateIdentifier = string;
export type TransitionToHook = (
	hook: HookInput,
) => StateIdentifier | Promise<StateIdentifier>;

export type HookInput = {
	context: unknown;
	emitter: EventEmitter;
	signal: AbortSignal;
	event?: unknown;
};

export type OnFinalHook = (hook: HookInput) => void | Promise<void>;
export type OnEntryHook = (hook: HookInput) => void | Promise<void>;
export type OnExitHook = (hook: HookInput) => void | Promise<void>;

export type StateMachineOptions = { id: string; context: unknown };

export class InvalidTransition extends Error {}
export class InvalidConstructor extends Error {}

export const EVENTS = {
	STARTED: "started",
	ENDED: "ended",
	STATE_ON_ENTRY: "state:onEntry",
	STATE_ON_TRANSITION: "state:onTransition",
	STATE_TRANSITIONED: "state:transitioned",
	STATE_ON_EXIT: "state:onExit",
};

export type StateMachineEvents = typeof EVENTS[keyof typeof EVENTS];

export type TransitionEvent = (
	hookInput: HookInput,
) => boolean | Promise<boolean>;

export interface State {
	id: StateIdentifier;
	transitionGuard?: TransitionEvent;
	autoTransition?: boolean;
	transitionTo?: TransitionToHook;
	onEntry?: OnEntryHook;
	onExit?: OnExitHook;
	onFinal?: OnFinalHook;
	initial?: boolean;
	final?: boolean;
}

export class StateMachine {
	public id: string;
	public emitter: EventEmitter;
	public context: unknown;
	public controller: AbortController;
	private current!: State;
	private _initial: State;
	private _states: Map<string, State>;

	static from(states: Array<State>, options?: StateMachineOptions) {
		validateStates(states);
		return new StateMachine(states, options, PREVENT_COSTRUCTOR_INSTANCE);
	}

	private constructor(
		states: Array<State>,
		options?: StateMachineOptions,
		symbol?: symbol,
	) {
		if (symbol !== PREVENT_COSTRUCTOR_INSTANCE) {
			throw new InvalidConstructor(
				"StateMachine must be created with `StateMachine.from`",
			);
		}
		this.id = options?.id || randomUUID();
		this.context = options?.context || {};
		this.emitter = new EventEmitter();
		this._initial = states.find((s) => s.initial) as State;
		this._states = new Map(states.map((s) => [s.id, s]));
		this.controller = new AbortController();
	}

	public send = async (event: unknown) => {
		const hookInput = {
			context: this.context,
			emitter: this.emitter,
			signal: this.controller.signal,
			event,
		};

		if (
			this.current.transitionGuard &&
			!this.current.transitionGuard(hookInput)
		) {
			return;
		}

		await this.executeState(this.current, event);
	};

	public start = async () => {
		this.current = this._initial;
		this.emitter.emit(EVENTS.STARTED, { stateId: this.current.id });
		await this.enter(this.current);
	};

	private enter = async (state: State) => {
		this.current = state;
		const { id: stateId } = state;
		if (state.onEntry) {
			this.emitter.emit(EVENTS.STATE_ON_ENTRY, { stateId });
			await state.onEntry({
				context: this.context,
				emitter: this.emitter,
				signal: this.controller.signal,
			});
		}

		if (state.autoTransition || state.final) {
			return this.executeState(this.current);
		}
	};

	private executeState = async (state: State, event?: unknown) => {
		this.current = state;
		const { id: stateId } = state;
		let destination;

		if (state.transitionTo) {
			this.emitter.emit(EVENTS.STATE_ON_TRANSITION, { stateId });

			const destinationId = await state.transitionTo({
				context: this.context,
				emitter: this.emitter,
				signal: this.controller.signal,
				event,
			});
			destination = this._states.get(destinationId);

			this.emitter.emit(EVENTS.STATE_TRANSITIONED, {
				stateId,
				destinationId,
			});
		}

		if (state.onExit) {
			this.emitter.emit(EVENTS.STATE_ON_EXIT, { stateId });
			await state.onExit({
				context: this.context,
				emitter: this.emitter,
				signal: this.controller.signal,
			});
		}

		if (state.final) {
			if (state.onFinal) {
				await state.onFinal({
					context: this.context,
					emitter: this.emitter,
					signal: this.controller.signal,
				});
			}
			this.emitter.emit(EVENTS.ENDED, { stateId });
			return;
		}

		if (!destination) throw new InvalidTransition("Invalid destination node");

		await this.enter(destination);
	};
}
