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
		assert.deepStrictEqual(machine.isFinished, false);
		await machine.send();
		assert.deepStrictEqual(machine.currentStateId, "ON");
		assert.deepStrictEqual(machine.isFinished, true);
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

test("send on final state", async () => {
	const machine = StateMachine.from(fixtures.withoutAutoTransition);
	await machine.start();
	await machine.send();
	assert.deepStrictEqual(machine.currentStateId, "ON");
	assert.deepStrictEqual(machine.isFinished, true);
	await assert.rejects(() => machine.send(), InvalidTransition);
});

test("assign event transitory", async () => {
	const machine = StateMachine.from(fixtures.transitoryAssignEventToContext);
	await machine.start();
	await machine.send("baz");
	assert.deepStrictEqual(machine.context.foo, "baz");
	assert.deepStrictEqual(machine.context.bar, "baz");
});

test("subscribe", async () => {
	const options = { context: { a: 42 } };
	const machine = StateMachine.from(fixtures.basicThreeStates, options);

	const outcome = [];
	machine.subscribe(({ context, currentStateId }) => {
		outcome.push({ [currentStateId]: context.a });
	});

	await machine.start();
	await machine.send(); // ONE -> TWO
	await machine.send(); // TWO -> THREE

	assert.deepEqual(outcome, [{ ONE: 42 }, { TWO: 42 }, { THREE: 42 }]);
});

test("unsubscribe", async () => {
	const options = { context: { a: 42 } };
	const machine = StateMachine.from(fixtures.basicThreeStates, options);

	const outcome = [];
	const subId = machine.subscribe(({ context, currentStateId }) => {
		outcome.push({ [currentStateId]: context.a });
	});

	await machine.start();
	await machine.send(); // ONE -> TWO
	machine.unsubscribe(subId);
	await machine.send(); // TWO -> THREE

	assert.deepEqual(outcome, [{ ONE: 42 }, { TWO: 42 }]);
});

test("check context is mutable", async () => {
	const options = { context: { a: 42 } };
	const machine = StateMachine.from(fixtures.basicThreeStates, options);

	const outcome = [];
	machine.subscribe(({ context, currentStateId }) => {
		if (currentStateId === "TWO") {
			context.a = 0;
		}
		outcome.push({ [currentStateId]: context.a });
	});

	await machine.start();
	await machine.send(); // ONE -> TWO
	await machine.send(); // TWO -> THREE

	assert.deepEqual(outcome, [{ ONE: 42 }, { TWO: 0 }, { THREE: 0 }]);
});

test("check subscribe call is after onEntry", async () => {
	const options = { context: { a: 42 } };
	const machine = StateMachine.from(fixtures.onEntryContextChange, options);

	const outcome = [];
	machine.subscribe(({ context, currentStateId }) => {
		outcome.push({ [currentStateId]: context.a });
	});

	await machine.start();

	assert.deepEqual(outcome, [{ OFF: 10 }, { ON: 10 }]);
});

test("check subscribe call is before onExit", async () => {
	const options = { context: { a: 42 } };
	const machine = StateMachine.from(fixtures.onExitContextChange, options);

	const outcome = [];
	machine.subscribe(({ context, currentStateId }) => {
		outcome.push({ [currentStateId]: context.a });
	});

	await machine.start();

	assert.deepEqual(outcome, [{ OFF: 42 }, { ON: 10 }]);
});
