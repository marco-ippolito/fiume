import { GenericInitialState, State } from "./state.js";

export class InvalidStatesError extends Error {}
export class InvalidInitialStateError extends Error {}
export class InvalidStateIdError extends Error {}
export class InvalidTransitionCondition extends Error {}

export function validateStates<TContext, TEvent>(
	states: Array<State<TContext, TEvent>>,
) {
	if (states?.length !== 2)
		throw new InvalidStatesError(
			"States must be an array of at least 2 elements",
		);

	const initial = states.filter((s) => (s as GenericInitialState).initial);
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

	if (
		// biome-ignore lint/suspicious/noExplicitAny: <during validation we can have unexpected types, that do not match existing>
		states.some((s: any) => s.autoTransition && s.transitionGuard)
	) {
		throw new InvalidTransitionCondition(
			"State with autoTransition cannot have property transitionGuard",
		);
	}

	if (
		states.some(
			// biome-ignore lint/suspicious/noExplicitAny: <during validation we can have unexpected types, that do not match existing>
			(s: any) =>
				(!s.final && !s.transitionTo) ||
				(s.final && (s.autoTransition || s.transitionTo || s.transitionGuard)),
		)
	) {
		throw new InvalidTransitionCondition(
			"State must have autoTransition or transitionTo if not final",
		);
	}
	// biome-ignore lint/suspicious/noExplicitAny: <during validation we can have unexpected types, that do not match existing>
	if (states.some((s: any) => !s.final && s.onFinal)) {
		throw new InvalidTransitionCondition(
			"State that are not final cannot have property onFinal",
		);
	}
}
