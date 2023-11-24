import { expectAssignable, expectNotAssignable, expectType } from "tsd";
import {
	State,
	StateMachine,
	StateMachineOptions,
} from "./../../dist/index.js";

const states: Array<State> = [
	// @ts-expect-error
	{
		id: "1",
		initial: true,
	},
	// @ts-expect-error
	{
		id: "1",
		initial: false,
	},
	// @ts-expect-error
	{
		id: "2",
		initial: true,
		autoTransition: true,
	},
	// @ts-expect-error
	{
		id: "2",
		initial: false,
		autoTransition: true,
	},
	// @ts-expect-error
	{
		id: "2",
		initial: true,
		autoTransition: false,
	},
	// @ts-expect-error
	{
		id: "2",
		initial: false,
		autoTransition: false,
	},
	{
		id: "1",
		initial: true,
		transitionTo: () => "2",
	},
	{
		id: "1",
		initial: false,
		transitionTo: () => "2",
	},
	{
		id: "1",
		initial: true,
		autoTransition: true,
		transitionTo: () => "2",
	},
	{
		id: "1",
		initial: false,
		autoTransition: true,
		transitionTo: () => "2",
	},
	{
		id: "1",
		initial: true,
		autoTransition: false,
		transitionTo: () => "2",
	},
	{
		id: "1",
		initial: false,
		autoTransition: false,
		transitionTo: () => "2",
	},
	// @ts-expect-error
	{
		id: "1",
		initial: true,
		transitionGuard: () => true,
	},
	// @ts-expect-error
	{
		id: "1",
		initial: false,
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: true,
		transitionTo: () => "2",
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: false,
		transitionTo: () => "2",
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: true,
		autoTransition: true,
		transitionTo: () => "2",
		// @ts-expect-error
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: false,
		autoTransition: true,
		transitionTo: () => "2",
		// @ts-expect-error
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: true,
		autoTransition: false,
		transitionTo: () => "2",
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: false,
		autoTransition: false,
		transitionTo: () => "2",
		transitionGuard: () => true,
	},
	// @ts-expect-error
	{
		id: "1",
		initial: true,
		final: true,
		autoTransition: false,
		transitionTo: () => "2",
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: true,
		final: false,
		autoTransition: false,
		transitionTo: () => "2",
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: false,
		final: false,
		autoTransition: false,
		transitionTo: () => "2",
		transitionGuard: () => true,
	},
	{
		id: "1",
		initial: false,
		final: false,
		autoTransition: false,
		transitionTo: () => "2",
		transitionGuard: () => true,
		onEntry: () => {},
		onExit: () => {},
	},
	{
		id: "1",
		initial: true,
		transitionTo: () => "2",
		onEntry: () => {},
		onExit: () => {},
	},
	{
		id: "1",
		initial: true,
		transitionTo: () => "2",
		// @ts-expect-error
		onFinal: () => {},
	},
	{
		id: "1",
		transitionTo: () => "2",
		onFinal: () => {},
	},
	{
		id: "1",
		final: true,
	},
	{
		id: "1",
		final: true,
		initial: false,
	},
	// @ts-expect-error
	{
		id: "1",
		final: true,
		initial: true,
	},
	{
		id: "1",
		final: true,
		// @ts-expect-error
		autoTransition: true,
	},
	{
		id: "1",
		final: true,
		// @ts-expect-error
		autoTransition: false,
	},
	{
		id: "1",
		final: true,
		// @ts-expect-error
		transitionGuard: () => true,
	},
	{
		id: "1",
		final: true,
		// @ts-expect-error
		transitionTo: () => "2",
	},
	{
		id: "1",
		final: true,
		onEntry: () => {},
		onExit: () => {},
		onFinal: () => {},
	},
];

const basicStates: Array<State> = [
	{ id: "ON", final: true },
	{
		id: "OFF",
		initial: true,
		autoTransition: true,
		transitionTo: () => "ON",
	},
];

expectNotAssignable<State>({});
expectNotAssignable<State>({ id: 1 });
expectNotAssignable<State>(null);
expectNotAssignable<State>(undefined);
expectAssignable<State>({ id: "", final: true });

type EmptyObject = Record<PropertyKey, never>;
expectAssignable<StateMachineOptions<EmptyObject>>({ id: "", context: {} });

expectAssignable<StateMachineOptions<string>>({
	id: "",
	context: "hello",
});

expectNotAssignable<StateMachineOptions<string>>({
	id: "",
	context: 1,
});

expectNotAssignable<StateMachineOptions<string>>({
	id: "",
	context: {},
});

expectAssignable<StateMachineOptions>({ id: "" });
expectAssignable<StateMachineOptions<EmptyObject>>({ context: {} });
expectAssignable<StateMachineOptions>({});
expectNotAssignable<StateMachineOptions>(null);
<StateMachineOptions>{ foo: "bar" };

expectType<StateMachine>(StateMachine.from(basicStates));

const machine = StateMachine.from<number, number>(basicStates);

machine.send(1);
