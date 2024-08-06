import assert from "node:assert";
import test from "node:test";
import { StateMachine } from "../dist/index.js";

test("#171 - event is available on 'subscribe' callback", async () => {
	const subscriptionEvent = [];

	const states = [
		{
			id: "OFF",
			initial: true,
			transitionTo: () => "ON",
		},
		{
			id: "ON",
			transitionTo: () => "OFF",
		},
	];

	const context = {};
	const sharedData = {};
	const machine = StateMachine.from(states, {
		context,
		sharedData,
	});

	machine.subscribe((event) => {
		subscriptionEvent.push(event);
	});

	// Start the state machine
	await machine.start();

	const event1 = { name: "foo", value: 1 };
	await machine.send(event1);
	const event2 = { name: "foo", value: 2 };
	await machine.send(event2);

	assert.deepStrictEqual(subscriptionEvent, [
		{
			context,
			currentStateId: "OFF",
			event: undefined,
			sharedData,
		},
		{
			context,
			currentStateId: "ON",
			event: event1,
			sharedData,
		},
		{
			context,
			currentStateId: "OFF",
			event: event2,
			sharedData,
		},
	]);
});
