import assert from "node:assert";
import test from "node:test";
import { StateMachine } from "../dist/index.js";
import * as fixtures from "./fixtures/fixtures.js";

test("simple snapshot", async () => {
	const id = "foo";
	const context = "bar";
	const machine = StateMachine.from(fixtures.withoutAutoTransition, {
		id,
		context,
	});
	await machine.start();
	assert.doesNotThrow(() => machine.createSnapshot());
	{
		const snapshot = machine.createSnapshot();
		assert.deepStrictEqual(id, snapshot.machineId);
		assert.deepStrictEqual("OFF", snapshot.stateId);
		assert.deepStrictEqual(context, snapshot.context);
	}

	await machine.send();
	{
		const snapshot = machine.createSnapshot();
		assert.deepStrictEqual(id, snapshot.machineId);
		assert.deepStrictEqual("ON", snapshot.stateId);
		assert.deepStrictEqual(context, snapshot.context);
	}
});

test("snapshot after changing context", async () => {
	const context = {};
	const machine = StateMachine.from(fixtures.onEntryContextChange, { context });
	await machine.start();
	{
		const snapshot = machine.createSnapshot();
		assert.deepStrictEqual("ON", snapshot.stateId);
		assert.deepStrictEqual(10, snapshot.context.a);
	}
});

test("hydration", async () => {
	const id = "foo";
	const context = "bar";
	const sharedData = "foobar";
	const machine = StateMachine.from(fixtures.withoutAutoTransition, {
		id,
		context,
		sharedData,
	});
	await machine.start();

	{
		const snapshot = machine.createSnapshot();
		assert.deepStrictEqual(snapshot.sharedData, undefined);
		const hydratedMachine = StateMachine.rehydrate(
			snapshot,
			fixtures.withoutAutoTransition,
			sharedData,
		);
		await hydratedMachine.start();
		assert.deepStrictEqual(id, hydratedMachine.id);
		assert.deepStrictEqual("OFF", hydratedMachine.currentStateId);
		assert.deepStrictEqual(context, hydratedMachine.context);
		assert.deepStrictEqual(sharedData, hydratedMachine.sharedData);
	}

	await machine.send();

	{
		const snapshot = machine.createSnapshot();
		assert.deepStrictEqual(snapshot.sharedData, undefined);
		const hydratedMachine = StateMachine.rehydrate(
			snapshot,
			fixtures.withoutAutoTransition,
			sharedData,
		);
		await hydratedMachine.start();
		assert.deepStrictEqual(id, hydratedMachine.id);
		assert.deepStrictEqual("ON", hydratedMachine.currentStateId);
		assert.deepStrictEqual(context, hydratedMachine.context);
		assert.deepStrictEqual(sharedData, hydratedMachine.sharedData);
	}
});
