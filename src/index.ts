import { randomUUID } from "crypto";
import { validateStates } from "./validate.js";

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

export class StateMachine {
	public id: string;
	private _initial: State;
	private _states: Map<string, State>;
	private _context: unknown;

	constructor(states: Array<State>, options?: StateMachineOptions) {
		validateStates(states);
		this.id = options?.id || randomUUID();
		this._context = options?.context || {};
		this._initial = states.find((s) => s.initial) as State;
		this._states = new Map(states.map((s) => [s.id, s]));
	}

	public start = async () => {
		await this.executeState(this._initial);
	};

	private executeState = async (state: State) => {
		if (state.onEntry) {
			await state.onEntry(this._context);
		}

		const destinationId = await state.transition(this._context);

		if (state.onExit) {
			await state.onExit(this._context);
		}

		if (state.final) {
			return;
		}

		const destination = this._states.get(destinationId);

		if (!destination) throw new Error("Invalid destination node");

		await this.executeState(destination);
	};
}
