import { expectAssignable, expectNotAssignable, expectType } from "tsd";
import { State, StateMachine, StateMachineOptions } from "../../dist/index.js";

const basicStates = [
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
expectAssignable<State>({ id: "" });

expectAssignable<StateMachineOptions>({ id: "", context: {} });
expectAssignable<StateMachineOptions>({ id: "" });
expectAssignable<StateMachineOptions>({ context: {} });
expectAssignable<StateMachineOptions>({});
expectNotAssignable<StateMachineOptions>(null);
expectNotAssignable<StateMachineOptions>({ foo: "bar" });

expectType<StateMachine>(StateMachine.from(basicStates));
