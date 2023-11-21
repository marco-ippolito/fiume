# FIUME

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
    transitionTo: await ({ context, signal, event }) => Promise.resolve("ON"),
    onEntry: ({ context, signal }) => console.log('onEntry hook triggered'),
    onExit: async ({ context, signal }) => { await logAsync(context) },
  },
  {
    id: "ON",
    transitionTo: () => "OFF",
    onEntry: async ({ context, signal }) => { await fetch('http://example.org', { signal }) },
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

## API

### StateMachine

#### Constructor

```typescript
import { StateMachine } from "fiume";
const machine = StateMachine.from(states, options);

```

- `states`: An array of `State` objects representing the states of the state machine.
- `options` (optional): Configuration options for the state machine, including `id` (string) and `context` (generic).

#### Public Methods

- `start`: Initiates the state machine and triggers the execution of the initial state.

- `send`: Send events to states that are not `autoTransition`. If current state has `autoTransition: false`, calling the `send` function is required to move to next state.

#### Public properties

- `id` string: The id of the machine, if not supplied in the constructor, will be a randomUUID.

- `controller` AbortController: you can listen to the abort signal inside hooks.
  The `AbortSignal` is always passed inside hooks:

```typescript
const states: Array<State> = [
  {
    id: "OFF", initial: true,
    transitionTo: async ({ context, signal }) => {
      const res = await fetch('my-website', { signal });
      if(res.status !== 200) return 'ERROR'
      return 'ON'
    },
  },
  ///...
];
```

- `currentStateId` string: The id of current state of the machine.

- `context` unknown: User defined context, it's always passed inside hooks:

```typescript
const states: Array<State> = [
  {
    id: "state-0", initial: true,
    autoTransition: true,
    transitionTo: async ({ context, signal }) => {
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

### State

Represents a state in the state machine.

```typescript
interface State<TContext = unknown, TEvent = unknown> {
 id: StateIdentifier;
 autoTransition?: boolean;
 initial?: boolean;
 final?: boolean;
 transitionGuard?: TransitionEvent<TContext, TEvent>;
 transitionTo?: TransitionToHook<TContext, TEvent>;
 onEntry?: OnEntryHook<TContext, TEvent>;
 onExit?: OnExitHook<TContext, TEvent>;
 onFinal?: OnFinalHook<TContext>;
}
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
