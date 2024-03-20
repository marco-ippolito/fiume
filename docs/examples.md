# Slot Machine
## Installation

```bash
npm install fiume
```

## Usage

```ts
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

```ts
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

```ts

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
  { context: { foo: 'foo', bar: 'bar' }}
);

// Start the state machine
await machine.start();

await machine.send({ name: 'foo', value: 1 });
machine.currentStateId; // ON
await machine.send({ name: 'foo', value: 2 });
machine.currentStateId; // OFF

```

You can also `subscribe` to state transitions:

```ts

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