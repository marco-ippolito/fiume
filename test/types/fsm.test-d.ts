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
