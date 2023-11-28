# FIUME

**Fiume** is a zero-dependency, simple, and flexible state machine
library written in TypeScript.
It is compatible with all JavaScript runtimes and is designed to manage
the flow of a system through various states.
This library provides a lightweight and intuitive way to define states,
transitions, and hooks for state entry, exit, and transition events.

Unlike other libraries, **Fiume** does not require hardcoding state transitions.
Instead, you can write the transition logic inside the `transitionTo` function.

## Installation

```bash
npm install fiume
```

## Usage

```typescript
import { StateMachine, State } from "fiume";

// Define a simple ON-OFF machine
const states: Array<State> = [
  {
    id: "OFF",
    initial: true,
    transitionGuard: ({ event }) => event === 'button clicked',
    transitionTo: () => "ON",
  },
  {
    id: "ON",
    transitionGuard: ({ event }) => event === 'button clicked',
    transitionTo: () => "OFF",
  },
];

// Create a state machine instance
const machine = StateMachine.from(states);

// Start the state machine
await machine.start();
console.log(machine.currentStateId); // OFF

// Trigger a transition by sending an event
await machine.send('button clicked');
console.log(machine.currentStateId); // ON

// Trigger another transition
await machine.send('button clicked');
console.log(machine.currentStateId); // OFF

// Trigger another transition
await machine.send('wrong event'); // wrong event wont trigger the transition
console.log(machine.currentStateId); // OFF

```

With `autoTransition` set to `true`, the machine does not wait
for the `send` method to trigger the transition to the next state:

```typescript
import { StateMachine, State } from "fiume";

const states: Array<State> = [
  {
    id: "OFF",
    initial: true,
    autoTransition: true,
    transitionTo: () => "ON",
  },
  {
    id: "ON",
    final: true,
  },
];

const machine = StateMachine.from(states);
await machine.start();
console.log(machine.currentStateId); // ON

```

You can define custom hooks `onEntry`, `onExit` and `onFinal`:

```typescript

const states: Array<State> = [
  {
    id: "OFF",
    initial: true,
    transitionTo: async ({ context, event, sharedData }) => "ON",
    onEntry: async ({ context, event, sharedData }) => console.log(event.name, event.value),
    onExit: async ({ context, event, sharedData }) => console.log(event.name, event.value),
  },
  {
    id: "ON",
    final: true,
    transitionTo: ({ context, event, sharedData }) => "OFF",
    onEntry: async ({ context, event, sharedData }) => console.log(event.name, event.value),
    onExit: ({ context, event, sharedData }) => console.log(event.name, event.value),
    onFinal: ({ context, event, sharedData }) => console.log(event.name, event.value),
  },
];

type MyContext = { foo: string, bar: string }
type MyEvent = { name: string, value: number }

const machine = StateMachine.from<MyContext, MyEvent>(
  states,
  { context: { foo: 'foo', bar: 'bar' }
);

// Start the state machine
await machine.start();

await machine.send({ name: 'foo', value: 1 });
machine.currentStateId; // ON
await machine.send({ name: 'foo', value: 2 });
machine.currentStateId; // OFF

```

You can also `subscribe` to state transitions:

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
await machine.start();

// Subscribe to state transitions
const subId = machine.subscribe(
  ({ context, currentStateId }) => console.log(currentStateId)
); // ONE, TWO
console.log(machine.currentStateId); // ONE
await machine.send();
console.log(machine.currentStateId); // TWO

// Unsubscribe the previous subscription
machine.unsubscribe(subId);

await machine.send();
console.log(machine.currentStateId); // THREE

```

## API

### StateMachine

#### Constructor

- `StateMachine.from`: A static function that returns a
new instance of the state machine. It takes the following parameters:
  - `states`: An array of `State` objects representing the states of the state machine.
  - `options` (optional): Configuration options for the state machine:
    - `id` (string): The id of the machine,
    - `context`: User-defined object.
    > Don't add in `context` objects that cannot be copied,
    like database connections, sockets, emitter, request, etc. Instead use `sharedData`!
    - `sharedData`: User-defined object.
    > Use `sharedData` to store database connection, sockets, request/response, etc.

Example:

```typescript
import { StateMachine } from "fiume";
const machine = StateMachine.from(states, options);

```

- `StateMachine.fromSnapshot`:  A static function that returns a new instance
of the state machine from an existing snapshot. It takes the following parameters:
  - `snapshot`: The snapshot object produced by `machine.createSnapshot()`.
  - `states`: An array of `State` objects representing the states of the state machine.
  - `sharedData` (optional): User-defined object.

Example:

```typescript
import { StateMachine } from "fiume";
const machine = StateMachine.from(states, options);
await machine.start();
const snapshot = machine.createSnapshot();
const refromSnapshot = StateMachine.fromSnapshot(snapshot, states);

```

#### Public Methods

- `start` (async): Initiates the state machine and
  triggers the execution of the initial state.

- `send` (async): Send events to states that are not `autoTransition`.
If current state has `autoTransition: false`,
calling the `send` function is required to move to next state.
If the machine is in a final state and  `isFinished` set to `true`,
using `send` will reject.

- `createSnapshot`: Returns a snapshot of the current machine
  with the following properties:
  - snapshotId (string): Id of the current snapshot.
  - machineId: (string): Id of the machine.
  - stateId: (string): Id of the current state when snapshot is taken.
  - context: (TContext):  User defined context

  >`sharedData` will not be snapshotted!

- `subscribe`: You can register a callback that will be invoked
on every state transition between the `onEntry` and `onExit` hooks.
The callback returns the `subscriptionId` and receives `context` and `currentStateId`.

- `unsubscribe`: Remove the subscription with the given `subscriptionId`.

#### Public properties

- `id` string: The id of the machine,
if not supplied in the constructor, will be a randomUUID.

- `currentStateId` string: The id of current state of the machine.

- `isFinished` boolean: True if the machine has finished in a final state.

- `context`: User defined context.

- `sharedData` (TSharedData): User defined data shared with the state machine.

> Do not add in `context`, objects that cannot be copied,
like database connections, `EventEmitter`, `Request`,
`Socket`, use `sharedData` instead!

### State

Represents a state in the state machine.

- `id`: (required) Unique identifier for the state.
- `transitionTo` (optional): Function or AsyncFunction that defines the
transition logic to move to another state, must return the id of the next state.
- `autoTransition` (optional): Boolean, if `true` the machine will transition to
the next state without waiting for an event. If set to `true`
is not possibile to use `transitionGuard`.
- `onEntry` (optional): Hook called when entering the state.
- `onExit` (optional): Hook called when exiting the state.
- `onFinal` (optional): Hook called when execution has ended in final state.
- `initial` (optional): Boolean indicating whether the state is the initial state,
there can only be one initial state.
- `final` (optional): Boolean indicating whether the state is a final state.
- `transitionGuard` (optional): Function or AsyncFunction takes as input
a user event and defines whether or not transition to the next state

## License

This library is licensed under the [Apache 2.0 License](LICENSE).
Feel free to use, modify, and distribute it as needed. Contributions are welcome!
