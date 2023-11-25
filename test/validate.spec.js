import {
	validateStates,
	InvalidStatesError,
	InvalidInitialStateError,
	InvalidStateIdError,
	InvalidTransitionCondition,
	validateHydration,
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

	/**
	 * Test all combinations of:
	 * - final
	 * - autoTransition
	 * - transitionGuard
	 * - transitionTo
	 */

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					final: true,
					autoTransition: true,
					transitionGuard: () => true,
					transitionTo: () => "A",
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					final: true,
					autoTransition: true,
					transitionGuard: () => true,
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					final: true,
					autoTransition: true,
					transitionTo: () => "B",
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					final: true,
					autoTransition: true,
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					final: true,
					transitionGuard: () => true,
					transitionTo: () => "A",
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					final: true,
					transitionGuard: () => true,
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					final: true,
					transitionTo: () => "A",
				},
			]),
		InvalidTransitionCondition,
	);

	assert.doesNotThrow(() =>
		validateStates([
			{
				id: "A",
				initial: true,
				transitionTo: () => "B",
			},
			{
				// state to validate
				id: "B",
				final: true,
			},
		]),
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					autoTransition: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					autoTransition: true,
					transitionGuard: () => true,
					transitionTo: () => "A",
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					autoTransition: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					autoTransition: true,
					transitionGuard: () => true,
				},
			]),
		InvalidTransitionCondition,
	);

	assert.doesNotThrow(() =>
		validateStates([
			{
				id: "A",
				initial: true,
				autoTransition: true,
				transitionTo: () => "B",
			},
			{
				// state to validate
				id: "B",
				autoTransition: true,
				transitionTo: () => "A",
			},
		]),
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					autoTransition: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					autoTransition: true,
				},
			]),
		InvalidTransitionCondition,
	);

	assert.doesNotThrow(() =>
		validateStates([
			{
				id: "A",
				initial: true,
				autoTransition: true,
				transitionTo: () => "B",
			},
			{
				// state to validate
				id: "B",
				transitionGuard: () => true,
				transitionTo: () => "A",
			},
		]),
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					autoTransition: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					transitionGuard: () => true,
				},
			]),
		InvalidTransitionCondition,
	);

	assert.doesNotThrow(() =>
		validateStates([
			{
				id: "A",
				initial: true,
				autoTransition: true,
				transitionTo: () => "B",
			},
			{
				// state to validate
				id: "B",
				transitionTo: () => "B",
			},
		]),
	);

	assert.throws(
		() =>
			validateStates([
				{
					id: "A",
					initial: true,
					autoTransition: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
				},
			]),
		InvalidTransitionCondition,
	);

	assert.throws(
		() =>
			validateHydration(
				[
					{
						id: "A",
						initial: true,
						autoTransition: true,
						transitionTo: () => "B",
					},
					{
						// state to validate
						id: "B",
						transitionTo: () => "B",
					},
				],
				"foo",
			),
		InvalidStateIdError,
	);

	assert.doesNotThrow(() =>
		validateHydration(
			[
				{
					id: "A",
					initial: true,
					autoTransition: true,
					transitionTo: () => "B",
				},
				{
					// state to validate
					id: "B",
					transitionTo: () => "B",
				},
			],
			"A",
		),
	);
});
