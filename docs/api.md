# API

## StateMachine
from [example](/examples)

## Constructor

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

## Public Methods

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

## Public properties

- `id` string: The id of the machine,
if not supplied in the constructor, will be a randomUUID.

- `currentStateId` string: The id of current state of the machine.

- `isFinished` boolean: True if the machine has finished in a final state.

- `context`: User defined context.

- `sharedData` (TSharedData): User defined data shared with the state machine.

> Do not add in `context`, objects that cannot be copied,
like database connections, `EventEmitter`, `Request`,
`Socket`, use `sharedData` instead!

## State

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
