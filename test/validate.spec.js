import {
	validateStates,
	InvalidStatesError,
	InvalidInitialStateError,
	InvalidStateIdError,
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
	assert.doesNotThrow(
		() =>
			validateStates([
				{ initial: true, id: "A" },
				{ initial: false, id: "B" },
			]),
		InvalidStateIdError,
	);
});
