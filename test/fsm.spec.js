import { StateMachine, EVENTS, InvalidDestionation } from "../dist/index.js";
import test from "node:test";
import assert from "node:assert";
import {
	basicStates,
	wrongDestination,
	basicStatesWithoutInitialDeclared,
} from "./fixtures/fixtures.js";

function testConstructor(states) {
	test("state machine constructor", async () => {
		const id = "foo";
		const machineWithId = new StateMachine(states, { id });
		assert.deepStrictEqual(machineWithId.id, id);

		const machine = new StateMachine(states);
		assert.ok(machine.id);
		assert.ok(typeof machine.id === "string");
		machine.emitter.on(EVENTS.STARTED, (e) =>
			assert.deepStrictEqual(e, { stateId: "OFF" }),
		);

		machine.emitter.on(EVENTS.STATE_ON_TRANSITION, (e) =>
			assert.deepStrictEqual(e, { stateId: "OFF" }),
		);

		machine.emitter.on(EVENTS.STATE_TRANSITIONED, (e) =>
			assert.deepStrictEqual(e, { stateId: "OFF", destinationId: "ON" }),
		);
		machine.emitter.on(EVENTS.STATE_ON_FINAL, (e) =>
			assert.deepStrictEqual(e, { stateId: "ON" }),
		);

		machine.emitter.on(EVENTS.ENDED, (e) =>
			assert.deepStrictEqual(e, { stateId: "ON" }),
		);
		await assert.doesNotReject(machine.start());
	});
}

testConstructor(basicStates);
testConstructor(basicStatesWithoutInitialDeclared);
testConstructor(basicStatesWithoutInitialDeclared.reverse());

test("state machine wrong destination", async () => {
	const machine = new StateMachine(wrongDestination);
	await assert.rejects(machine.start(), InvalidDestionation);
});
