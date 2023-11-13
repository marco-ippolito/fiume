import { State } from "./index.js";

export class InvalidStatesError extends Error {}
export class InvalidInitialStateError extends Error {}
export class InvalidStateIdError extends Error {}

export function validateStates(states: Array<State>) {
	if (states?.length !== 2)
		throw new InvalidStatesError(
			"States must be an array of at least 2 elements",
		);

	let initial: Array<State> = states.filter((s) => s.initial);
	initial =
		initial.length === 0
			? states.filter((s) => s.initial == null && !s.final)
			: initial;
	if (initial.length !== 1) {
		throw new InvalidInitialStateError(
			"There must be one and only initial state",
		);
	}

	if (!states.every((s) => typeof s.id === "string")) {
		throw new InvalidStateIdError("Ids must be of type string");
	}

	const uniqueIds = new Set(states.map((s) => s.id));
	if (uniqueIds.size !== states.length) {
		throw new InvalidStateIdError("Ids must be unique");
	}
}
