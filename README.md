# FIUME

A simple and flexible state machine library writte in Typescript for **Node.js**, designed to manage the flow of a system through various states.
This library provides a lightweight and intuitive way to define states, transitions, and hooks for state entry, exit, and transition events.

**Fiume**, does not require you to hardcode state transitions, instead you can write the transition logic inside `transitionTo` function.
You can communicate to the outside with a built-in `EventEmitter` that you can use to listen to external events or emit your own.

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
    transitionTo: async ({ context, emitter, signal }) => "ON", // write your transition logic here
    onExit: async ({ context, emitter, signal }) => console.log("Exiting OFF") // exit hook
  },
  {
    id: "ON",
    final: true,
    onEntry: async ({ context, emitter, signal }) => console.log("Entering ON") // entry hook
  },
];

// Define optional state machine options
const options: StateMachineOptions = {
  id: "my-state-machine",
  context: { someData: "initial data" }, // define your own context
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

#### Public properties

- `emitter` EventEmitter: you can use the eventemitter to listen to state machine generated events (transitions, started, ended, hooks etc...), or to emit events that you can listen in your hooks.

  Example:

```typescript
const states: Array<State> = [
  {
    id: "OFF", initial: true,
    transitionTo: async ({ context, emitter, signal }) => {
      await once(emitter, 'button-press'); // await custom event
      return 'ON'
    },
  },
  ///...
];
const myStateMachine = new StateMachine(states, options);
myStateMachine.emitter.on("started", ({ stateId }) => console.log(`StateMachine started in ${stateId}`)); // listen to machine generated events
myStateMachine.emitter.emit('button-press', {}); // emit custom event
```

- `controller` AbortController: you can listen to the abort signal inside hooks.

  The `AbortSignal` is always passed inside hooks:

```typescript
const states: Array<State> = [
  {
    id: "OFF", initial: true,
    transitionTo: async ({ context, emitter, signal }) => {
      await fetch('my-website', { signal });
      return 'ON'
    },
  },
  ///...
];
```

- `context`: User defined context.
  `context` is always passed inside hooks:

```typescript
const states: Array<State> = [
  {
    id: "state-0", initial: true,
    transitionTo: async ({ context, emitter, signal }) => {
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

### State

Represents a state in the state machine.

```typescript
interface State {
  id: StateIdentifier;
  transitionTo?: TransitionToHook;
  onEntry?: OnEntryHook;
  onExit?: OnExitHook;
  initial?: boolean;
  final?: boolean;
}

type HookInput = {
	context: unknown;
	emitter: EventEmitter;
	signal: AbortSignal;
};

type TransitionToHook = (hook: HookInput) => StateIdentifier | Promise<StateIdentifier>;
type OnEntryHook = (hook: HookInput) => void | Promise<void>;
type OnExitHook = (hook: HookInput) => void | Promise<void>;
```

- `id`: (required) Unique identifier for the state.
- `transitionTo` (optional): Function or AsyncFunction that defines the transition logic to move to another state, must return the id of the next state.
- `onEntry` (optional): Hook called when entering the state.
- `onExit` (optional): Hook called when exiting the state.
- `initial`: Boolean indicating whether the state is the initial state, there can only be one initial state.
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
