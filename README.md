# FIUME

A simple and flexible state machine library for TypeScript and JavaScript, designed to manage the flow of a system through various states. This library provides a lightweight and intuitive way to define states, transitions, and hooks for state entry, exit, and transition events.

## Installation

```bash
npm install fiume
```

## Usage

```typescript
import { StateMachine, State, StateMachineOptions } from "fiume";

// Define your states
const states: Array<State> = [
  { id: "state1", initial: true, onEntry: async () => console.log("Entering state1") },
  { id: "state2", transitionTo: async () => "state3" },
  { id: "state3", onExit: async () => console.log("Exiting state3"), final: true },
];

// Define optional state machine options
const options: StateMachineOptions = {
  id: "my-state-machine",
  context: { someData: "initial data" },
};

// Create a state machine instance
const myStateMachine = new StateMachine(states, options);

// Subscribe to state machine events
myStateMachine.emitter.on("started", ({ stateId }) => console.log(`StateMachine started in ${stateId}`));
myStateMachine.emitter.on("ended", ({ stateId }) => console.log(`StateMachine ended in ${stateId}`));

// Start the state machine
myStateMachine.start();
```

## API

### StateMachine

#### Constructor

```typescript
new StateMachine(states: Array<State>, options?: StateMachineOptions)
```

- `states`: An array of `State` objects representing the states of the state machine.
- `options` (optional): Configuration options for the state machine, including `id` (string) and `context` (unknown).

#### Methods

- `start`: Initiates the state machine and triggers the execution of the initial state.

### State

Represents a state in the state machine.

```javascript
interface State {
  id: StateIdentifier;
  transitionTo?: transitionToHook;
  onEntry?: undefined | OnEntryHook;
  onExit?: undefined | OnExitHook;
  initial?: boolean;
  final?: boolean;
}
```

- `id`: Unique identifier for the state.
- `transitionTo`: Function that defines the transition logic to move to another state.
- `onEntry` (optional): Hook called when entering the state.
- `onExit` (optional): Hook called when exiting the state.
- `initial`: Boolean indicating whether the state is the initial state.
- `final`: Boolean indicating whether the state is a final state.

### Events

The library emits various events that you can subscribe to using the `emitter` property.

- `started`: Triggered when the state machine is started.
- `ended`: Triggered when the state machine has completed its execution.
- `state:onEntry`: Triggered when entering a state.
- `state:onTransition`: Triggered when transitioning from one state to another.
- `state:transitioned`: Triggered after a successful state transition.
- `state:onExit`: Triggered when exiting a state.
- `state:onFinal`: Triggered when entering a final state.

## License

This library is licensed under the [Apache 2.0 License](LICENSE). Feel free to use, modify, and distribute it as needed. Contributions are welcome!