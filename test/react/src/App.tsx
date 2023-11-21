import { StateMachine, StateMachineOptions } from "fiume";
import { useEffect, useState } from "react";

const options: StateMachineOptions = {
	id: "my-state-machine",
	context: {},
};

function App() {
	const [stateId, setStateId] = useState<string>();
	const [machine] = useState<StateMachine>(
		StateMachine.from(
			[
				{
					id: "OFF",
					initial: true,
					transitionGuard: () => true,
					onEntry: () => setStateId("OFF"),
					transitionTo: () => "ON",
				},
				{
					id: "ON",
					final: true,
					onEntry: () => setStateId("ON"),
				},
			],
			options,
		),
	);

	useEffect(() => {
		if (machine) {
			machine.start();
		}
	}, [machine]);

	return (
		<>
			The current state ID is: <strong>{stateId}</strong>
			{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
			<button onClick={machine.send}>Next state</button>
		</>
	);
}

export default App;
