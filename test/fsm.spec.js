import assert from "node:assert";
import test from "node:test";
import {
	InvalidTransition,
	StateMachine,
	InvalidConstructor,
} from "../dist/index.js";
import * as fixtures from "./fixtures/fixtures.js";

test("state machine constructor", async () => {
	const id = "foo";
	const machineWithId = StateMachine.from(fixtures.basicStates, { id });
	assert.deepStrictEqual(machineWithId.id, id);

	const machine = StateMachine.from(fixtures.basicStates);
	assert.ok(machine.id);
	assert.ok(typeof machine.id === "string");
	await assert.doesNotReject(machine.start());
});

test("state machine wrong destination", async () => {
	const machine = StateMachine.from(fixtures.wrongDestination);
	await assert.rejects(machine.start(), InvalidTransition);
});

test("without auto transition", () => {
	assert.doesNotThrow(async () => {
		const machine = StateMachine.from(fixtures.withoutAutoTransition);
		await machine.start();
		assert.deepStrictEqual(machine.currentStateId, "OFF");
		await machine.send();
		assert.deepStrictEqual(machine.currentStateId, "ON");
	});
});

test("autoTransition", async () => {
	const machine = StateMachine.from(fixtures.autoTransition);
	await machine.start();
	assert.deepStrictEqual(machine.currentStateId, "ON");
});

test("invalidate constructor", () => {
	assert.throws(
		() => new StateMachine(fixtures.missingAutoTransition),
		InvalidConstructor,
	);
});

test("autoTransition", async () => {
	const machine = StateMachine.from(fixtures.autoTransition);
	await machine.start();
	assert.deepStrictEqual(machine.currentStateId, "ON");
});

test("simpleTransitionGuard", async () => {
	const machine = StateMachine.from(fixtures.simpleTransitionGuard);
	await machine.start();
	assert.deepStrictEqual(machine.currentStateId, "OFF");
	const res = await machine.send();
	assert.deepStrictEqual(res, undefined);
	assert.deepStrictEqual(machine.currentStateId, "OFF");
	await machine.send("foo");
	assert.deepStrictEqual(machine.currentStateId, "ON");
});

test("onEntryContextChange", async () => {
	const machine = StateMachine.from(fixtures.onEntryContextChange, {
		context: { a: 1 },
	});
	await machine.start();
	assert.deepStrictEqual(machine.context.a, 10);
});

test("onExitContextChange", async () => {
	const machine = StateMachine.from(fixtures.onExitContextChange, {
		context: { a: 1 },
	});
	await machine.start();
	assert.deepStrictEqual(machine.context.a, 10);
});

test("onFinalContextChange", async () => {
	const machine = StateMachine.from(fixtures.onFinalContextChange, {
		context: { a: 1 },
	});
	await machine.start();
	assert.deepStrictEqual(machine.currentStateId, "ON");
	assert.deepStrictEqual(machine.context.a, 10);
});

test("contextCheck in class", async () => {
	async function test() {
		const machine = StateMachine.from([
			{
				id: "ON",
				initial: true,
				autoTransition: true,
				transitionTo: () => {
					if (this.a > 0) {
						assert.deepStrictEqual(this.a, 10);
						return "OFF";
					}
				},
			},
			{
				id: "OFF",
				final: true,
			},
		]);
		this.machine = machine;
		await machine.start();
	}

	class Test {
		a = 10;
		machine;
		test = test.bind(this);
	}

	const t = new Test();
	await assert.doesNotReject(() => t.test());
	assert.deepStrictEqual(t.machine.currentStateId, "OFF");
});

test("check private properties are not enumerable", async () => {
	const machine = StateMachine.from(fixtures.basicStates);
	await machine.start();
	const clonedProps = structuredClone(machine);
	assert.deepStrictEqual(Object.keys(clonedProps), ["id", "context"]);
});

test("onEntrySharedDataChange", async () => {
	const machine = StateMachine.from(fixtures.onEntrySharedDataChange, {
		sharedData: { a: 1 },
	});
	await machine.start();
	assert.deepStrictEqual(machine.sharedData.a, 10);
});

test("onExitSharedDataChange", async () => {
	const machine = StateMachine.from(fixtures.onExitSharedDataChange, {
		sharedData: { a: 1 },
	});
	await machine.start();
	assert.deepStrictEqual(machine.sharedData.a, 10);
});

test("onFinalSharedDataChange", async () => {
	const machine = StateMachine.from(fixtures.onFinalSharedDataChange, {
		sharedData: { a: 1 },
	});
	await machine.start();
	assert.deepStrictEqual(machine.currentStateId, "ON");
	assert.deepStrictEqual(machine.sharedData.a, 10);
});
