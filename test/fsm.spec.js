import { StateMachine } from "../dist/index.js";
import test from "node:test";
import assert from "node:assert";
import { basicStates } from "./fixtures/fixtures.js";

test("state machine constructor", () => {
	const id = "foo";
	{
		const machine = new StateMachine(basicStates, { id });
		assert.deepStrictEqual(machine.id, id);
	}

	{
		const machine = new StateMachine(basicStates);
		assert.ok(machine.id);
		assert.ok(typeof machine.id === "string");
	}
});
