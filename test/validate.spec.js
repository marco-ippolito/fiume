import {
	validateStates,
	InvalidStatesError,
	InvalidInitialStateError,
	InvalidStateIdError,
	InvalidTransitionCondition,
} from "../dist/validate.js";
import test from "node:test";
import assert from "node:assert";

test("validates states correctly", () => {
	assert.throws(() => validateStates(null), InvalidStatesError);
	assert.throws(() => validateStates(undefined), InvalidStatesError);
	assert.throws(() => validateStates({}), InvalidStatesError);
	assert.throws(() => validateStates([]), InvalidStatesError);
	assert.throws(() => validateStates([{}]), InvalidStatesError);
	assert.throws(() => validateStates([{}, {}]), InvalidInitialStateError);
	assert.throws(
		() => validateStates([{ initial: false }, { initial: false }]),
		InvalidInitialStateError,
	);
	assert.throws(
		() => validateStates([{ initial: true }, { initial: true }]),
		InvalidInitialStateError,
	);
	assert.throws(
		() =>
			validateStates([
				{ initial: true, id: "A" },
				{ initial: false, id: "A" },
			]),
		InvalidStateIdError,
	);
	assert.throws(
		() => validateStates([{ initial: true, id: "A" }, { initial: false }]),
		InvalidStateIdError,
	);
	assert.throws(
		() =>
			validateStates([
				{ initial: true, id: "A" },
				{ initial: false, id: "B" },
			]),
		InvalidTransitionCondition,
	);
	assert.doesNotThrow(() =>
		validateStates([
			{ initial: true, id: "A", autoTransition: true },
			{ initial: false, id: "B", autoTransition: true },
		]),
	);
	assert.doesNotThrow(() =>
		validateStates([
			{ initial: true, id: "A", transitionGuard: true },
			{ initial: false, id: "B", autoTransition: true },
		]),
	);

	assert.throws(
		() =>
			validateStates([
				{
					initial: true,
					id: "A",
					transitionTo: () => "B",
					autoTransition: true,
					transitionGuard: () => {},
				},
				{ final: true, id: "B" },
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					initial: true,
					id: "A",
					autoTransition: true,
					transitionTo: () => "B",
					onFinal: () => {},
				},
				{ final: true, id: "B" },
			]),
		InvalidTransitionCondition,
	);
});
