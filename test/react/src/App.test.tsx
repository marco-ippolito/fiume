import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import App from './App'

describe('App', () => {
    afterEach(() => {
        cleanup()
    })

    test('correctly render initial state', () => {
        const { asFragment } = render(<App />)

        expect(asFragment()).toMatchSnapshot()
    })

    test('correctly render next state', async () => {
        const { asFragment } = render(<App />)

        const nextStateButton = await screen.getByText('Next state')
        await nextStateButton.click()

        await screen.findByText('ON')

        expect(asFragment()).toMatchSnapshot()
    })
})