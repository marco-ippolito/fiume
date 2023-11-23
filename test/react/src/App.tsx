import { StateMachine, StateMachineOptions } from "fiume";
import { useEffect, useState } from 'react';

const options: StateMachineOptions = {
  id: "my-state-machine"
}

function App() {
  const [stateId, setStateId] = useState<string>()
  const [state] = useState<StateMachine>(StateMachine.from([
    {
      id: "OFF",
      initial: true,
      transitionGuard: () => true,
      onEntry: () => setStateId("OFF"),
      transitionTo: () => "ON"
    },
    {
      id: "ON",
      final: true,
      onEntry: () => setStateId("ON"),
    },
  ], options))

  useEffect(() => {
    if (state) {
      state.start()
    }
  }, [state])

  return <>
    The current state ID is: <strong>{stateId}</strong>
    <button onClick={state.send}>
      Next state
    </button>
  </>
}

export default App
