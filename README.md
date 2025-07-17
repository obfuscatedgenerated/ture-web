# Ture on the web

See also: [the original Java implementation](https://github.com/obfuscatedgenerated/Ture)

## Syntax

The website will load to `LastFirst.ture` as an example file.

### Rules

Rules are defined in the following format:

```
(state, letter) -> (state, letter, direction)
```

Where `state` is the name of the state, `letter` is the symbol on the tape at the current position, `direction` is either `left` or `right` and `state` is the name of the next state.

When the pointer is over the given letter whilst in the given state on the LHS, it overwrites the letter with the new letter, changes to the new state, and moves the pointer in the direction specified on the RHS.

If no applicable rule is found, the machine halts.

The empty letter is represented by the symbol `⬚`.

The state names must not contain any of `,()⬚` or whitespace and letters must be a single character that is not `,()` or whitespace. It is convention to start state names with `q` but this is not enforced.

It is recommended to add a newline at the end of each rule, but this is optional. Whitespace is also allowed before and after rules.

Whitespace is permitted between tokens of the rule, but not within tokens such as state names or letters.

### Comments

Comments start with `%` and can be placed anywhere in the program. Comments run from the `%` to the end of the line.

You can escape with `\%`.

yap


yap


yap

yap

yap

yap

yap

yap

yap

yap

yap

yap

yap

yap

yap