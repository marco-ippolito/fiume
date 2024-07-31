import assert from "node:assert";
import test from "node:test";
import { StateMachine } from "../dist/index.js";

test("#165", async () => {
	const events = [];

	const states = [
		{
			id: "OFF",
			initial: true,
			transitionTo: async ({ context, event, sharedData }) => "ON",
			onEntry: async ({ context, event, sharedData }) => {
				events.push(event);
			},
		},
		{
			id: "ON",
			transitionTo: ({ context, event, sharedData }) => "OFF",
			onEntry: async ({ context, event, sharedData }) => {
				events.push(event);
			},
		},
	];

	const machine = StateMachine.from(states, {
		context: { foo: "foo", bar: "bar" },
	});

	// Start the state machine
	await machine.start();

	await machine.send({ name: "foo", value: 1 });
	machine.currentStateId; // ON

	await machine.send({ name: "foo", value: 2 });
	machine.currentStateId; // OFF

	assert.deepStrictEqual(events, [
		undefined,
		{ name: "foo", value: 1 },
		{ name: "foo", value: 2 },
	]);
});
