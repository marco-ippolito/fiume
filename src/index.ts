import { randomUUID } from "node:crypto";
import { validateStates } from "./validate.js";
import EventEmitter from "node:stream";

export type StateIdentifier = string;
export type TransitionToHook = (
	hook: HookInput,
) => StateIdentifier | Promise<StateIdentifier>;

export type HookInput = {
	context: unknown;
	emitter: EventEmitter;
	signal: AbortSignal;
};

export type OnEntryHook = (hook: HookInput) => void | Promise<void>;
export type OnExitHook = (hook: HookInput) => void | Promise<void>;

export type StateMachineOptions = { id: string; context: unknown };

export class InvalidDestionation extends Error {}

export const EVENTS = {
	STARTED: "started",
	ENDED: "ended",
	STATE_ON_ENTRY: "state:onEntry",
	STATE_ON_TRANSITION: "state:onTransition",
	STATE_TRANSITIONED: "state:transitioned",
	STATE_ON_EXIT: "state:onExit",
	STATE_ON_FINAL: "state:final",
};

export type StateMachineEvents = typeof EVENTS[keyof typeof EVENTS];

export interface State {
	id: StateIdentifier;
	transitionTo?: TransitionToHook;
	onEntry?: OnEntryHook;
	onExit?: OnExitHook;
	initial?: boolean;
	final?: boolean;
}

export class StateMachine {
	public id: string;
	public emitter: EventEmitter;
	public context: unknown;
	public controller: AbortController;
	private _initial: State;
	private _states: Map<string, State>;
	private _current!: State;

	constructor(states: Array<State>, options?: StateMachineOptions) {
		validateStates(states);
		this.id = options?.id || randomUUID();
		this.context = options?.context || {};
		this.emitter = new EventEmitter();
		const initial: State | undefined = states.find((s) => s.initial);
		this._initial = (
			!initial ? states.find((s) => s.initial == null && !s.final) : initial
		) as State;
		this._states = new Map(states.map((s) => [s.id, s]));
		this.controller = new AbortController();
	}

	public start = async () => {
		this._current = this._initial;
		this.emitter.emit(EVENTS.STARTED, { stateId: this._current.id });
		await this.executeState(this._current);
		this.emitter.emit(EVENTS.ENDED, { stateId: this._current.id });
	};

	private executeState = async (state: State) => {
		this._current = state;
		const { id: stateId } = state;
		let destination;

		if (state.onEntry) {
			this.emitter.emit(EVENTS.STATE_ON_ENTRY, { stateId });
			await state.onEntry({
				context: this.context,
				emitter: this.emitter,
				signal: this.controller.signal,
			});
		}

		if (state.transitionTo) {
			this.emitter.emit(EVENTS.STATE_ON_TRANSITION, { stateId });

			const destinationId = await state.transitionTo({
				context: this.context,
				emitter: this.emitter,
				signal: this.controller.signal,
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
			this.emitter.emit(EVENTS.STATE_ON_FINAL, { stateId });
			return;
		}

		if (!destination) throw new InvalidDestionation("Invalid destination node");

		await this.executeState(destination);
	};
}
