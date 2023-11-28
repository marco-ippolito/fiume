# Fiume 🏞️
[![npm version](https://img.shields.io/npm/v/fiume)](https://www.npmjs.com/package/fiume)
[![build status](https://img.shields.io/github/actions/workflow/status/marco-ippolito/fiume/ci.yml)](https://github.com/marco-ippolito/fiume/actions)
[![biome](https://img.shields.io/badge/code%20style-biome-brightgreen.svg?style=flat)]([https://biomejs.dev/])

A zero-dependencies, simple and flexible state machine library written in Typescript, compatible with all JS runtimes, designed to manage the flow of a system through various states.
This library provides a lightweight and intuitive way to define states, transitions, and hooks for state entry, exit, and transition events.
Unlike other libraries, **Fiume**, does not require you to hardcode state transitions, instead you can write the transition logic inside `transitionTo` function.
You can also access directly the reference of your machine and manipulate its public properties.

## Installation

```bash
npm install fiume
```

## Usage

```typescript
import { StateMachine, State } from "fiume";
// simple ON OFF machine
const states: Array<State> = [
  {
    id: "OFF", // id of the state
    initial: true, // when started the machine will execute it as first
    transitionTo: () => "ON", // return the id of the state you want to transition to
  },
  {
    id: "ON",
    transitionTo: () => "OFF",
  },
];

// Create a state machine instance
const machine = StateMachine.from(states);

// Start the state machine
await machine.start();
machine.currentStateId; // OFF
await machine.send('button clicked'); // the send will trigger the transition
machine.currentStateId; // ON
await machine.send('button clicked again');
machine.currentStateId; // OFF

```

With autoTransition the machine will not wait for the `send` to trigger the transition to the next state:

```typescript
import { StateMachine, State } from "fiume";

const states: Array<State> = [
  {
    id: "OFF",
    initial: true,
    autoTransition: true, // tells the machine not to wait for an external event to transition to next state
    transitionTo: () => "ON",
  },
  {
    id: "ON",
    final: true,
  },
];

const machine = StateMachine.from(states);
await machine.start();
machine.currentStateId; // ON

```

It is possibile to define custom hooks on machine transition:

```typescript

const states: Array<State> = [
  {
    id: "OFF",
    initial: true,
    transitionTo: await ({ context, event }) => Promise.resolve("ON"),
    onEntry: ({ context }) => console.log('onEntry hook triggered'),
    onExit: async ({ context }) => { await logAsync(context) },
  },
  {
    id: "ON",
    transitionTo: () => "OFF",
    onEntry: async ({ context }) => { await fetch('http://example.org') },
    onExit: () => {},
  },
];

type MyContext = { foo: string, bar: string }
type MyEvent = { eventName: string, eventValue: number }

const machine = StateMachine.from<MyContext, MyEvent>(states, {context: { foo: 'foo', bar: 'bar' }});

// Start the state machine
await machine.start();

await machine.send({ eventName: 'foo', eventValue: 1 });
machine.currentStateId; // ON
await machine.send({ eventName: 'foo', eventValue: 2 });
machine.currentStateId; // OFF

```

You can calso `subscribe` to state changes:

```typescript

const states: Array<State> = [
  {
    id: "ONE",
    initial: true,
    transitionTo: () => "TWO",
  },
  {
    id: "TWO",
    transitionTo: () => "THREE",
  },
  { id: "THREE", final: true },
];

const machine = StateMachine.from(states);

// Start the state machine
await machine.start();

// subscribe to state transitions
const subId = machine.subscribe(({ context, currentStateId }) => console.log(currentStateId)); // ONE, TWO

machine.currentStateId; // ONE
await machine.send();
machine.currentStateId; // TWO

// unsubscribe the previous subscription
machine.unsubscribe(subId);

await machine.send();
machine.currentStateId; // THREE

```

## API

### StateMachine

#### Constructor

- `StateMachine.from`: static function that returns a new instance of the state machine, takes as input:
  - `states`: An array of `State` objects representing the states of the state machine.
  - `options` (optional): Configuration options for the state machine:
    - `id` (string): The id of the machine,
    - `context`: User defined context.
    > Don't add in `context` objects that cannot be copied, like database connections, sockets, emitter,    request, use `sharedData` instead!
    - `sharedData`: User defined object.
    > Use `sharedData` to store database connection, sockets, request/response, etc ...

Example:

```typescript
import { StateMachine } from "fiume";
const machine = StateMachine.from(states, options);

```

- `StateMachine.fromSnapshot`: static function that returns a new instance of the state machine from an existing snapshot, takes as input:
  - `snapshot`: The snapshot object produced by `machine.createSnapshot()`.
  - `states`: An array of `State` objects representing the states of the state machine.
  - `sharedData` (optional): User defined object.

Example:

```typescript
import { StateMachine } from "fiume";
const machine = StateMachine.from(states, options);
await machine.start();
const snapshot = machine.createSnapshot();
const refromSnapshot = StateMachine.fromSnapshot(snapshot, states);

```

#### Public Methods

- `start` (async): Initiates the state machine and triggers the execution of the initial state.

- `send` (async): Send events to states that are not `autoTransition`. If current state has `autoTransition: false`, calling the `send` function is required to move to next state. If the machine is in a final state and  `isFinished` set to `true`, using `send` will reject.

- `createSnapshot`: Returns a snapshot of the current machine with the following properties:
  - snapshotId (string): Id of the current snapshot.
  - machineId: (string): Id of the machine.
  - stateId: (string): Id of the current state when snapshot is taken.
  - context: (TContext):  User defined context

  >`sharedData` will not be snapshotted!

- `subscribe`: You can register a callback that will be invoked on every state transition between the `onEntry` and `onExit` hooks. The callback returns the `subscriptionId` and receives `context` and `currentStateId`.

- `unsubscribe`: Remove the subscription with the given `subscriptionId`.

#### Public properties

- `id` string: The id of the machine, if not supplied in the constructor, will be a randomUUID.

- `currentStateId` string: The id of current state of the machine.

- `isFinished` boolean: True if the machine has finished in a final state.

- `context` (TContext): User defined context, it's always passed inside hooks:

> Do not add in `context`, objects that cannot be copied, like database connections, `EventEmitter`, `Request`, `Socket`, use `sharedData` instead!

```typescript
const states: Array<State> = [
  {
    id: "state-0",
    initial: true,
    transitionTo: async ({ context }) => {
      if(context.foo === 'bar'){ // use context to pass data to other states
        return 'state-1'
      } else {
        return 'state-2'
      }
    },
  },
  ///...
];
```

- `sharedData` (TSharedData): User defined data shared with the state machine, it's always passed inside hooks:

> `sharedData` will not be snapshotted, use this object to store database connection, sockets, request/response, etc ...

```typescript
const states: Array<State> = [
  {
    id: "state-0",
    initial: true,
    transitionTo: async ({ sharedData }) => {
      if(sharedData.foo === 'bar'){
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
