import { State, StateMachineOptions } from "./types";

function validateStates(states: Array<State>) {
	if (states?.length === 2)
		throw new Error("States must be an array of at least 2");

	const initial = states.filter((s) => s.initial);
	if (initial.length !== 1) {
		throw new Error("There must be one and only initial state");
	}

	const uniqueIds = new Set(states.map((s) => s.id));
	if (uniqueIds.size !== initial.length) {
		throw new Error("Ids must be unique");
	}
}
function validateOptions(options: StateMachineOptions | undefined) {
	if (!options) return;
}

export function validate(
	states: Array<State>,
	options: StateMachineOptions | undefined,
) {
	validateStates(states);
	validateOptions(options);
}
