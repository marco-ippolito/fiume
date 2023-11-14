# FIUME

A simple and flexible state machine library written in Typescript, compatible with all JS runtimes, designed to manage the flow of a system through various states.
This library provides a lightweight and intuitive way to define states, transitions, and hooks for state entry, exit, and transition events.
Unlike other libraries, **Fiume**, does not require you to hardcode state transitions, instead you can write the transition logic inside `transitionTo` function.
You can also access directly the reference of your machine and manipulate its public properties.


## Installation

```bash
npm install fiume
```

## Usage

```typescript
import { StateMachine, State, StateMachineOptions } from "fiume";

// simple ON OFF machine
const states: Array<State> = [
  {
    id: "OFF", // id of the state
    initial: true, // when started the machine will execute it as first
    autoTransition: true, // tells the machine not to wait for an external event to transition to next state
    transitionTo: async ({ context, signal }) => "ON", // write your transition logic here
    onExit: async ({ context, signal }) => console.log("Exiting OFF") // exit hook
  },
  {
    id: "ON",
    final: true,
    onFinal: async ({ context, signal }) => console.log("Exiting machine"), // entry hook
    onEntry: async ({ context, signal }) => console.log("Entering ON") // entry hook
  },
];

// Define optional state machine options
const options: StateMachineOptions = {
  id: "my-state-machine",
  context: { someData: "initial data" }, // define your own context
};

// Create a state machine instance
const myStateMachine = StateMachine.from(states, options);

// Start the state machine
await myStateMachine.start();
```

## API

### StateMachine

#### Constructor

```typescript
StateMachine.from(states: Array<State>, options?: StateMachineOptions)
```

- `states`: An array of `State` objects representing the states of the state machine.
- `options` (optional): Configuration options for the state machine, including `id` (string) and `context` (unknown).

#### Methods

- `start`: Initiates the state machine and triggers the execution of the initial state.
- `send`: Send events to states that are not `autoTransition`. If current state has `autoTransition: false`, calling the `send` function is required to move to next state.

#### Public properties

- `controller` AbortController: you can listen to the abort signal inside hooks.
  The `AbortSignal` is always passed inside hooks:

```typescript
const states: Array<State> = [
  {
    id: "OFF", initial: true,
    transitionTo: async ({ context, signal }) => {
      await fetch('my-website', { signal });
      return 'ON'
    },
  },
  ///...
];
```

- `context` unknown: User defined context, it's always passed inside hooks:

```typescript
const states: Array<State> = [
  {
    id: "state-0", initial: true,
    autoTransition: true,
    transitionTo: async ({ context, signal }) => {
      if(context.a === 10){ // use context to pass data to other
        return 'state-1'
      } else {
        return 'state-2'
      }
    },
  },
  ///...
];
```

- `current` State: The current state of the machine

### State

Represents a state in the state machine.

```typescript
interface State {
	id: StateIdentifier;
	transitionGuard?: TransitionEvent;
	autoTransition?: boolean;
	transitionTo?: TransitionToHook;
	onEntry?: OnEntryHook;
	onExit?: OnExitHook;
	onFinal?: OnFinalHook;
	initial?: boolean;
	final?: boolean;
}

type HookInput = {
	context: unknown;
	signal: AbortSignal;
	event?: unknown;
};

type TransitionEvent = (hookInput: HookInput) => boolean | Promise<boolean>;
type TransitionToHook = (hook: HookInput) => StateIdentifier | Promise<StateIdentifier>;
type OnEntryHook = (hook: HookInput) => void | Promise<void>;
type OnExitHook = (hook: HookInput) => void | Promise<void>;
type OnFinalHook = (hook: HookInput) => void | Promise<void>;
```

- `id`: (required) Unique identifier for the state.
- `transitionTo` (optional): Function or AsyncFunction that defines the transition logic to move to another state, must return the id of the next state.
- `autoTransition` (optional): Boolean, if `true` the machine will transition to the next state without waiting for an event. If set to `true` is not possibile to use `transitionGuard`.
- `onEntry` (optional): Hook called when entering the state.
- `onExit` (optional): Hook called when exiting the state.
- `onFinal` (optional): Hook called when execution has ended in final state.
- `initial` (optional): Boolean indicating whether the state is the initial state, there can only be one initial state.
- `final` (optional): Boolean indicating whether the state is a final state.
- `transitionGuard` (optional): Function or AsyncFunction takes as input a user event and defines whether or not transition to the next state

## License

This library is licensed under the [Apache 2.0 License](LICENSE). Feel free to use, modify, and distribute it as needed. Contributions are welcome!
